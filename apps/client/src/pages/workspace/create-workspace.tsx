import * as React from "react";
import * as z from "zod";
import { useForm, zodResolver } from "@mantine/form";
import {
  Container,
  Title,
  TextInput,
  Button,
  Box,
  Text,
  Textarea,
  Anchor,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { getAppName } from "@/lib/config.ts";
import { useCreateWorkspaceMutation } from "@/features/workspace/queries/workspace-query.ts";
import { Link, useNavigate } from "react-router-dom";
import classes from "@/features/auth/components/auth.module.css";

const formSchema = z.object({
  name: z.string().min(1, "Workspace name is required").max(50),
  description: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateWorkspacePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
      <div>
        <Container size={420} className={classes.container}>
          <Box p="xl" className={classes.containerBox}>
            <Title order={2} ta="center" fw={500} mb="md">
              {t("Create new workspace")}
            </Title>
            <Text c="dimmed" size="sm" ta="center" mb="lg">
              {t("Create a separate workspace for a different team or project")}
            </Text>

            <form onSubmit={form.onSubmit(onSubmit)}>
              <TextInput
                id="name"
                type="text"
                label={t("Workspace Name")}
                placeholder={t("e.g ACME Inc")}
                variant="filled"
                mt="md"
                required
                {...form.getInputProps("name")}
              />

              <Textarea
                id="description"
                label={t("Description")}
                placeholder={t("Optional description for the workspace")}
                variant="filled"
                mt="md"
                minRows={2}
                {...form.getInputProps("description")}
              />

              <Button
                type="submit"
                fullWidth
                mt="xl"
                loading={createWorkspaceMutation.isPending}
              >
                {t("Create workspace")}
              </Button>
            </form>

            <Text ta="center" mt="lg" size="sm">
              <Anchor component={Link} to="/home">
                {t("Cancel")}
              </Anchor>
            </Text>
          </Box>
        </Container>
      </div>
    </>
  );
}
