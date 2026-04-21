import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  stories,
  topics as mockTopics,
  sources as mockSources,
  timelineEvents,
} from "@/lib/mock-data";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
}

function mapBiasLabel(bias: string): string {
  if (bias === "pro-gov") return "Pro-Federal-Government";
  if (bias === "opposition") return "Opposition-Leaning";
  return "Independent";
}

export async function POST() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Seeding is only allowed in development" },
      { status: 403 }
    );
  }

  if (!serviceRoleKey) {
    return NextResponse.json(
      {
        error:
          "SUPABASE_SERVICE_ROLE_KEY is not set on the server. Add it to your environment before seeding.",
      },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // 1) Seed topics (upsert by slug)
  const topicsPayload = mockTopics.map((t) => ({
    name: t.name,
    slug: t.slug === "tech" ? "technology" : t.slug,
    icon: t.icon,
    description: null,
    article_count: (t as any).storyCount ?? 0,
    is_featured: true,
  }));

  const { data: topicsData, error: topicsError } = await supabase
    .from("topics")
    .upsert(topicsPayload, { onConflict: "slug" })
    .select();

  if (topicsError) {
    return NextResponse.json(
      { step: "topics", error: topicsError.message },
      { status: 500 }
    );
  }

  const topicIdBySlug =
    topicsData?.reduce<Record<string, string>>((acc, t: any) => {
      acc[t.slug] = t.id;
      return acc;
    }, {}) ?? {};

  // 2) Seed sources (skip if name already exists)
  const { data: existingSources, error: existingSourcesError } = await supabase
    .from("sources")
    .select("id, name");

  if (existingSourcesError) {
    return NextResponse.json(
      { step: "existing_sources", error: existingSourcesError.message },
      { status: 500 }
    );
  }

  const newSourcesPayload = mockSources
    .filter(
      (s) => !existingSources?.some((row) => row.name === s.name)
    )
    .map((s) => ({
      name: s.name,
      website_url: s.url,
      rss_url: null,
      bias_label: mapBiasLabel(s.bias),
      factuality_score: s.factuality,
      ownership_type: s.ownership,
      region_focus: s.region,
      logo_url: null,
      is_active: true,
    }));

  let sourcesInserted = 0;

  if (newSourcesPayload.length > 0) {
    const { data: sourcesData, error: sourcesError } = await supabase
      .from("sources")
      .insert(newSourcesPayload)
      .select();

    if (sourcesError) {
      return NextResponse.json(
        { step: "sources", error: sourcesError.message },
        { status: 500 }
      );
    }

    sourcesInserted = sourcesData?.length ?? 0;
  }

  // Fetch all sources (for linking articles later)
  const { data: dbSources, error: dbSourcesError } = await supabase
    .from("sources")
    .select("id, name")
    .order("name", { ascending: true });

  if (dbSourcesError) {
    return NextResponse.json(
      { step: "db_sources", error: dbSourcesError.message },
      { status: 500 }
    );
  }

  const defaultSourceId = dbSources?.[0]?.id ?? null;

  // 3) Seed story_clusters from mock stories
  const clustersPayload = stories.map((story) => {
    const topicSlug = story.topic === "tech" ? "technology" : story.topic;

    const bias = story.biasBreakdown;
    const biasTotal =
      (bias.proGov ?? 0) +
        (bias.independent ?? 0) +
        (bias.opposition ?? 0) || 1;

    const biasPercentages = {
      proGov: Math.round(((bias.proGov ?? 0) / biasTotal) * 100),
      independent: Math.round(((bias.independent ?? 0) / biasTotal) * 100),
      opposition: Math.round(((bias.opposition ?? 0) / biasTotal) * 100),
    };

    const maxBias = Math.max(
      biasPercentages.proGov,
      biasPercentages.independent,
      biasPercentages.opposition
    );

    let blindspotSide: string | null = null;
    if (maxBias === biasPercentages.proGov) blindspotSide = "Pro-Government";
    else if (maxBias === biasPercentages.opposition) blindspotSide = "Opposition";
    else blindspotSide = "Independent";

    return {
      headline: story.headline,
      ai_summary: story.summary,
      topics: [topicSlug],
      is_blindspot: story.isBlindspot,
      blindspot_type: story.isBlindspot ? blindspotSide : null,
      pro_gov_coverage: biasPercentages.proGov,
      independent_coverage: biasPercentages.independent,
      opposition_coverage: biasPercentages.opposition,
      article_count: story.sourceCount,
    };
  });

  const { data: clustersData, error: clustersError } = await supabase
    .from("story_clusters")
    .insert(clustersPayload)
    .select();

  if (clustersError) {
    return NextResponse.json(
      { step: "story_clusters", error: clustersError.message },
      { status: 500 }
    );
  }

  const clustersCount = clustersData?.length ?? 0;

  // 4) Link clusters to topics (cluster_topics)
  const clusterTopicsPayload =
    clustersData?.flatMap((cluster: any) => {
      const slugs: string[] = cluster.topics ?? [];
      return slugs
        .map((slug) => {
          const topicId = topicIdBySlug[slug];
          if (!topicId) return null;
          return {
            cluster_id: cluster.id,
            topic_id: topicId,
          };
        })
        .filter((row): row is { cluster_id: string; topic_id: string } => !!row);
    }) ?? [];

  let clusterTopicsInserted = 0;

  if (clusterTopicsPayload.length > 0) {
    const { data: clusterTopicsData, error: clusterTopicsError } = await supabase
      .from("cluster_topics")
      .insert(clusterTopicsPayload)
      .select();

    if (clusterTopicsError) {
      return NextResponse.json(
        { step: "cluster_topics", error: clusterTopicsError.message },
        { status: 500 }
      );
    }

    clusterTopicsInserted = clusterTopicsData?.length ?? 0;
  }

  // 5) Seed a story timeline + events from timelineEvents
  const timelinePayload = {
    title: "2027 Election Coverage",
    slug: "2027-election-coverage",
    description:
      "Key events and coverage for the 2027 general elections in Nigeria, as tracked by NaijaPulse.",
    is_active: true,
  };

  const { data: timelineRow, error: timelineError } = await supabase
    .from("story_timelines")
    .upsert(timelinePayload, { onConflict: "slug" })
    .select()
    .single();

  if (timelineError) {
    return NextResponse.json(
      { step: "story_timelines", error: timelineError.message },
      { status: 500 }
    );
  }

  const eventsPayload = timelineEvents.map((event) => {
    const date = new Date(event.date);
    const eventDate = isNaN(date.getTime())
      ? new Date().toISOString().slice(0, 10)
      : date.toISOString().slice(0, 10);

    let eventType = "development";
    if ((event as any).status === "disputed") eventType = "disputed";
    else if ((event as any).status === "crisis") eventType = "crisis";

    return {
      timeline_id: timelineRow.id,
      cluster_id: null,
      event_date: eventDate,
      event_summary: event.title,
      event_type: eventType,
      pro_gov_coverage: event.biasBreakdown.proGov,
      independent_coverage: event.biasBreakdown.independent,
      opposition_coverage: event.biasBreakdown.opposition,
      article_count: event.coverageCount,
    };
  });

  const { data: eventsData, error: eventsError } = await supabase
    .from("timeline_events")
    .insert(eventsPayload)
    .select();

  if (eventsError) {
    return NextResponse.json(
      { step: "timeline_events", error: eventsError.message },
      { status: 500 }
    );
  }

  const eventsInserted = eventsData?.length ?? 0;

  // 6) Seed a daily briefing based on the clusters we just created
  let briefingsUpserted = 0;

  if (clustersData && clustersData.length > 0) {
    const heroCluster = clustersData[0] as any;
    const blindspotCluster = clustersData.find(
      (c: any) => c.is_blindspot
    ) as any | undefined;

    const storyIds = clustersData.map((c: any) => c.id);

    const briefingDate = new Date().toISOString().slice(0, 10);

    const totalArticles = clustersData.reduce(
      (sum: number, c: any) => sum + (c.article_count ?? 0),
      0
    );

    const briefingPayload = {
      briefing_date: briefingDate,
      headline_story_id: heroCluster.id,
      story_ids: storyIds,
      blindspot_story_id: blindspotCluster?.id ?? null,
      ai_intro:
        "NaijaPulse Daily Briefing generated from current story clusters and bias coverage.",
      total_articles: totalArticles,
      estimated_read_minutes: 12,
    };

    const { data: briefingData, error: briefingError } = await supabase
      .from("daily_briefings")
      .upsert(briefingPayload, { onConflict: "briefing_date" })
      .select();

    if (briefingError) {
      return NextResponse.json(
        { step: "daily_briefings", error: briefingError.message },
        { status: 500 }
      );
    }

    briefingsUpserted = briefingData?.length ?? 0;
  }

  // 7) Seed minimal articles, one per cluster
  let articlesInserted = 0;
  let articlesData: any[] = [];

  if (clustersData && clustersData.length > 0) {
    const articlesPayload = clustersData.map((cluster: any) => ({
      source_id: defaultSourceId,
      cluster_id: cluster.id,
      title: cluster.headline,
      url: `https://example.com/articles/${cluster.id}`,
      content: cluster.ai_summary,
      image_url: null,
      published_at: cluster.created_at ?? new Date().toISOString(),
      bias_label: cluster.blindspot_type,
      bias_score: {
        proGov: cluster.pro_gov_coverage,
        independent: cluster.independent_coverage,
        opposition: cluster.opposition_coverage,
      },
      factuality_score: 7.0,
      state_tags: [],
      scraped_at: new Date().toISOString(),
    }));

    const { data: insertedArticles, error: articlesError } = await supabase
      .from("articles")
      .insert(articlesPayload)
      .select();

    if (articlesError) {
      return NextResponse.json(
        { step: "articles", error: articlesError.message },
        { status: 500 }
      );
    }

    articlesData = insertedArticles ?? [];
    articlesInserted = articlesData.length;
  }

  // 8) Seed dummy user "Adegoke" and related activity
  let userProfileUpserted = 0;
  let userReadsInserted = 0;
  let userEventsInserted = 0;
  let userQuizResultsInserted = 0;

  try {
    const targetEmail = "adegoke@example.com";

    const userByEmail = await (supabase as any).auth.admin.getUserByEmail(
      targetEmail
    );

    let userId: string | null = userByEmail?.data?.user?.id ?? null;

    if (!userId) {
      const created = await (supabase as any).auth.admin.createUser({
        email: targetEmail,
        password: "Adegoke123!",
        email_confirm: true,
      });

      if (created.error) {
        console.error("Error creating Adegoke user:", created.error.message);
      } else {
        userId = created.data?.user?.id ?? null;
      }
    }

    if (userId) {
      // Clear any existing per-user data to make seeding idempotent
      await supabase.from("user_article_reads").delete().eq("user_id", userId);
      await supabase.from("gamification_events").delete().eq("user_id", userId);
      await supabase.from("quiz_results").delete().eq("user_id", userId);

      // user_profiles (extend Supabase auth user)
      const today = new Date().toISOString().slice(0, 10);

      const badges = [
        { code: "bias_buster", label: "Bias Buster" },
        { code: "news_hawk", label: "News Hawk" },
      ];

      const preferences = {
        favorite_topics: ["politics", "economy"],
        preferred_bias: "independent",
      };

      const { data: userProfile, error: userProfileError } = await supabase
        .from("user_profiles")
        .upsert(
          {
            id: userId,
            username: "adegoke",
            display_name: "Adegoke",
            avatar_url: null,
            naira_points: 4250,
            streak_count: 7,
            longest_streak: 10,
            last_active_date: today,
            badges,
            articles_read: 12,
            quizzes_completed: 1,
            state: "Lagos",
            lga: "Ikeja",
            preferences,
          },
          { onConflict: "id" }
        )
        .select();

      if (!userProfileError) {
        userProfileUpserted = userProfile?.length ?? 0;
      }

      // user_article_reads — link Adegoke to some of the seeded articles
      const readsPayload =
        articlesData.slice(0, 5).map((article: any, index: number) => ({
          user_id: userId,
          article_id: article.id,
          source_id: article.source_id ?? defaultSourceId,
          bias_label: article.bias_label ?? "Independent",
          factuality_score: article.factuality_score ?? 7.0,
          read_at: new Date(
            Date.now() - index * 24 * 60 * 60 * 1000
          ).toISOString(),
        })) ?? [];

      if (readsPayload.length > 0) {
        const { data: readsData, error: readsError } = await supabase
          .from("user_article_reads")
          .insert(readsPayload)
          .select();

        if (!readsError) {
          userReadsInserted = readsData?.length ?? 0;
        }
      }

      // gamification_events — simple history for Adegoke
      const eventsPayload = [
        {
          user_id: userId,
          event_type: "article_read",
          points_earned: 5,
          metadata: { source: "Premium Times" },
        },
        {
          user_id: userId,
          event_type: "article_read_opposing_view",
          points_earned: 10,
          metadata: { source: "Sahara Reporters" },
        },
        {
          user_id: userId,
          event_type: "quiz_completed",
          points_earned: 25,
          metadata: { quiz_date: today },
        },
      ];

      const { data: eventsData2, error: eventsError2 } = await supabase
        .from("gamification_events")
        .insert(eventsPayload)
        .select();

      if (!eventsError2) {
        userEventsInserted = eventsData2?.length ?? 0;
      }

      // quiz_results — one completed quiz
      const answers = [
        { question_id: 1, correct: true },
        { question_id: 2, correct: false },
        { question_id: 3, correct: true },
        { question_id: 4, correct: true },
        { question_id: 5, correct: false },
      ];

      const { data: quizData, error: quizError } = await supabase
        .from("quiz_results")
        .insert({
          user_id: userId,
          quiz_date: today,
          score: 3,
          total_questions: 5,
          answers,
          points_earned: 75,
        })
        .select();

      if (!quizError) {
        userQuizResultsInserted = quizData?.length ?? 0;
      }
    }
  } catch (e) {
    console.error("Error seeding Adegoke user data", e);
  }

  return NextResponse.json(
    {
      status: "ok",
      topicsUpserted: topicsData?.length ?? 0,
      sourcesInserted,
      clustersInserted: clustersCount,
      clusterTopicsInserted,
      timelineEventsInserted: eventsInserted,
      dailyBriefingsUpserted: briefingsUpserted,
      articlesInserted,
      userProfileUpserted,
      userReadsInserted,
      userEventsInserted,
      userQuizResultsInserted,
    },
    { status: 200 }
  );
}

