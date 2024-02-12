'use client'

import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage, Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";


const isWorkSpaceNameAvailable = async (name: string): Promise<boolean> => {

    const response = await fetch(`${process.env.NEXT_PUBLIC_HOSTED_URL!}/api/workspace/check-workspace?workspace-name=${name}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json'
      }
    });
  
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
  
    const data = await response.json();
    return data;
  };

export default function WorkSpace() {

    return (
        <div className="flex flex-row h-screen w-screen">
            <div className="flex items-center justify-center basis-1/2 bg-foreground">
                <div className="flex text-2xl font-medium text-cyan-50">
                    WiseBot
                </div>
            </div>
            <div className="flex items-center justify-center basis-1/2 bg-white">
                <InputForm/>
            </div>
        </div>
    )
}


const FormSchema = z.object({
    workspace: z.string().min(6, {
        message: "Workspace name must be at least 6 characters.",
    }),
})

const InputForm = () => {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            workspace: "",
        },
    })

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        const result =  await isWorkSpaceNameAvailable(data.workspace)
        toast({
            title: "You submitted the following values:",
            description: (
                <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
                    <code className="text-white">{result? "available" : "already exists"}</code>
                </pre>
            ),
        })
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
