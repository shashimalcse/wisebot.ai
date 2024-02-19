'use client'

import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage, Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";


const isWorkSpaceNameAvailable = async (name: string, confirmation: string): Promise<boolean> => {

    const response = await fetch(`${process.env.NEXT_PUBLIC_HOSTED_URL!}/api/workspace/check?workspace-name=${name}&confirmation=${confirmation}`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data.available;
};

export default function WorkSpace() {

    const searchParams = useSearchParams()
    const confirmation = searchParams.get('confirmation')
    console.log(searchParams.get('username'))
    const username = searchParams.get('username')
    return (
        <div className="flex flex-row h-screen w-screen">
            <div className="flex items-center justify-center basis-1/2 bg-foreground">
                <div className="flex text-2xl font-medium text-cyan-50">
                    WiseBot
                </div>
            </div>
            <div className="flex items-center justify-center basis-1/2 bg-white">
                <InputForm confirmation={confirmation ? confirmation : ""} username={username ? username : ""} />
            </div>
        </div>
    )
}

const createWorkSpace = async (name: string, confirmation: string, username: string): Promise<OrganizationCreateResult> => {

    const response = await fetch(`${process.env.NEXT_PUBLIC_HOSTED_URL!}/api/workspace/create?workspace-name=${name}&confirmation=${confirmation}&username=${username}`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const data: OrganizationCreateResult = await response.json();
    return data;
};


type InputFormProps = {
    confirmation: string,
    username: string,
}


const InputForm = ({ confirmation, username }: InputFormProps) => {

    const router = useRouter()

    const FormSchema = z.object({
        workspace: z.string().min(6, {
            message: "Workspace name must be at least 6 characters.",
        }),
    })
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            workspace: "",
        },
    })

    async function onSubmit(data: z.infer<typeof FormSchema>) {

        const orgResult = await createWorkSpace(data.workspace, confirmation, username)
        console.log(orgResult)
        if (orgResult) {
            router.replace('/')
        }
    }
        return (
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
                    <FormField
                        control={form.control}
                        name="workspace"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Workspace Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="WorkSpace" {...field} />
                                </FormControl>
                                <FormDescription>
                                    This is your wokrspace name.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit">Submit</Button>
                </form>
            </Form>
        )
    }
