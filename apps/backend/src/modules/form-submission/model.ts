import { t, type UnwrapSchema } from "elysia";

export const FormSubmissionModel = {
  createBody: t.Object({
    type: t.Union([t.Literal("CONTACT"), t.Literal("NEWSLETTER"), t.Literal("CUSTOM_ORDER")]),
    payload: t.Any(), // Flexible JSON payload depending on the form
    userId: t.Optional(t.String()),
  }),
  updateStatusBody: t.Object({
    status: t.Union([t.Literal("PENDING"), t.Literal("REVIEWED"), t.Literal("RESOLVED"), t.Literal("SPAM")]),
    adminNotes: t.Optional(t.String()),
  }),
  query: t.Object({
    type: t.Optional(t.String()),
    status: t.Optional(t.String()),
    page: t.Optional(t.String()),
    limit: t.Optional(t.String()),
  }),
};

export type FormSubmissionModel = {
  [K in keyof typeof FormSubmissionModel]: UnwrapSchema<(typeof FormSubmissionModel)[K]>;
};
