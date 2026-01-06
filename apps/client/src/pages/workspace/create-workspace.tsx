import * as z from "zod";
import { useForm, zodResolver } from "@mantine/form";
import {
  Container,
  Title,
  TextInput,
  Button,
  Text,
  Textarea,
  Paper,
  Group,
  Stack,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { getAppName } from "@/lib/config.ts";
import { useCreateWorkspaceMutation } from "@/features/workspace/queries/workspace-query.ts";
import { Link } from "react-router-dom";

const formSchema = z.object({
  name: z.string().min(1, "Workspace name is required").max(50),
  description: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateWorkspacePage() {
  const { t } = useTranslation();
  const createWorkspaceMutation = useCreateWorkspaceMutation();

  const form = useForm<FormValues>({
    validate: zodResolver(formSchema),
    initialValues: {
      name: "",
      description: "",
    },
  });

  async function onSubmit(data: FormValues) {
    createWorkspaceMutation.mutate(
      { name: data.name, description: data.description },
      {
        onSuccess: () => {
          // The mutation already redirects on success via page reload
        },
      }
    );
  }

  return (
    <>
      <Helmet>
        <title>{t("Create Workspace")} - {getAppName()}</title>
      </Helmet>
      <Container size="sm" py="xl">
        <Paper p="xl" withBorder>
          <Stack gap="md">
            <div>
              <Title order={2} fw={500}>
                {t("Create new workspace")}
              </Title>
              <Text c="dimmed" size="sm" mt="xs">
                {t("Create a separate workspace for a different team or project")}
              </Text>
            </div>

            <form onSubmit={form.onSubmit(onSubmit)}>
              <Stack gap="md">
                <TextInput
                  id="name"
                  type="text"
                  label={t("Workspace Name")}
                  placeholder={t("e.g ACME Inc")}
                  variant="filled"
                  required
                  {...form.getInputProps("name")}
                />

                <Textarea
                  id="description"
                  label={t("Description")}
                  placeholder={t("Optional description for the workspace")}
                  variant="filled"
                  minRows={2}
                  {...form.getInputProps("description")}
                />

                <Group justify="flex-end" mt="md">
                  <Button
                    variant="default"
                    component={Link}
                    to="/home"
                  >
                    {t("Cancel")}
                  </Button>
                  <Button
                    type="submit"
                    loading={createWorkspaceMutation.isPending}
                  >
                    {t("Create workspace")}
                  </Button>
                </Group>
              </Stack>
            </form>
          </Stack>
        </Paper>
      </Container>
    </>
  );
}
