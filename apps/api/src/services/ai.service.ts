export async function generateTaskDescription(title: string, context?: string) {
  if (!process.env.OPENAI_API_KEY) {
    return `Goal: ${title}\n\nAcceptance criteria:\n- Define the expected outcome.\n- Confirm edge cases.\n- Add tests or QA notes.\n\nContext:\n${context || "No extra context provided."}`;
  }

  return `AI-generated task description for "${title}". Connect the OpenAI Responses API here for production.`;
}

export async function summarizeProject(tasks: Array<{ title: string; status: string; priority: string }>) {
  const completed = tasks.filter((task) => task.status === "done").length;
  return `Project status: ${completed}/${tasks.length} tasks complete. Highest attention items: ${tasks
    .filter((task) => task.priority === "urgent" || task.priority === "high")
    .map((task) => task.title)
    .slice(0, 5)
    .join(", ") || "none"}.`;
}
