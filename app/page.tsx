import CreatePlanForm from "@/components/CreatePlanForm";
import RecentPlans from "@/components/RecentPlans";

export default function Home() {
  return (
    <div className="flex flex-1 justify-center bg-stone-50 px-4 py-16 dark:bg-stone-950">
      <main className="flex w-full max-w-lg flex-col gap-10">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
            🍽️ Meal Rotation Planner
          </h1>
          <p className="text-stone-600 dark:text-stone-400">
            Build a repeating weekly meal rotation, put it on the calendar, and share it with
            your household &mdash; recipes, ingredients, and grocery lists included.
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <CreatePlanForm />
        </div>

        <RecentPlans />
      </main>
    </div>
  );
}
