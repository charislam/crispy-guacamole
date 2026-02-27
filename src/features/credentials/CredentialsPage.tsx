import { Button } from "@/components/ui/button.js";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card.js";
import { Input } from "@/components/ui/input.js";
import { Label } from "@/components/ui/label.js";
import { useCredentialsForm } from "./useCredentialsForm.js";

export function CredentialsPage() {
	const { onSubmit } = useCredentialsForm();

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const data = new FormData(e.currentTarget);
		onSubmit(data.get("url") as string, data.get("key") as string);
	};

	return (
		<div className="flex items-center justify-center min-h-screen p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Connect to Supabase</CardTitle>
					<CardDescription>
						Enter your Supabase project URL and API key to get started.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="url">Project URL</Label>
							<Input
								id="url"
								name="url"
								type="url"
								placeholder="https://your-project.supabase.co"
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="key">API Key</Label>
							<Input
								id="key"
								name="key"
								type="password"
								placeholder="your-anon-or-service-key"
								required
							/>
						</div>
						<Button type="submit" className="w-full">
							Save credentials
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
