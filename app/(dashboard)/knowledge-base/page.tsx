import { getSystemPrompt } from "@/lib/dal";
import { saveSystemPrompt } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Textarea as TextArea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function KnowledgeBasePage() {
  const currentPrompt = await getSystemPrompt();

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Knowledge Base</h1>
        <p className="mt-1 text-sm text-zinc-500">
          The system prompt controls how the Aditi agent behaves in live chat.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col items-start gap-1">
          <CardTitle className="text-base font-medium">
            System Prompt
          </CardTitle>
          <CardDescription>
            Edit the instructions sent to the Gemini model before each
            conversation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveSystemPrompt} className="flex flex-col gap-4">
            <TextArea
              name="prompt"
              defaultValue={currentPrompt}
              className="font-mono text-sm min-h-[400px]"
              placeholder="Enter the system prompt…"
            />
            <div className="flex items-center gap-3">
              <Button type="submit" className="bg-primary text-primary-foreground">
                Save prompt
              </Button>
              <p className="text-xs text-zinc-500">
                Changes apply to all new chat messages immediately.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
