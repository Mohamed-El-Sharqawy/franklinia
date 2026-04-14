import { Elysia, status } from "elysia";
import { StaticPageService } from "./service";
import { StaticPageModel } from "./model";

/**
 * StaticPage module handles both dynamic informational Pages 
 * and legal Policies.
 */
export const staticPageModule = new Elysia({ prefix: "/static" })
  // --- Pages ---
  .get("/pages", async () => {
    const pages = await StaticPageService.listPages();
    return { success: true as const, data: pages };
  })
  .get("/pages/:slug", async ({ params: { slug } }) => {
    const page = await StaticPageService.getPageBySlug(slug);
    if (!page) return status(404, { success: false as const, error: "Page not found" });
    return { success: true as const, data: page };
  })
  .post("/pages", async ({ body }) => {
    const page = await StaticPageService.createPage(body as any);
    return { success: true as const, data: page };
  }, {
    body: StaticPageModel.createPageBody,
  })
  .patch("/pages/:id", async ({ params: { id }, body }) => {
    const page = await StaticPageService.updatePage(id, body as any);
    if (!page) return status(404, { success: false as const, error: "Page not found" });
    return { success: true as const, data: page };
  }, {
    body: StaticPageModel.updatePageBody,
  })
  .delete("/pages/:id", async ({ params: { id } }) => {
    await StaticPageService.deletePage(id);
    return { success: true as const, message: "Page deleted" };
  })

  // --- Policies ---
  .get("/policies", async () => {
    const policies = await StaticPageService.listPolicies();
    return { success: true as const, data: policies };
  })
  .get("/policies/:slug", async ({ params: { slug } }) => {
    const policy = await StaticPageService.getPolicyBySlug(slug);
    if (!policy) return status(404, { success: false as const, error: "Policy not found" });
    return { success: true as const, data: policy };
  })
  .post("/policies", async ({ body }) => {
    const policy = await StaticPageService.createPolicy(body as any);
    return { success: true as const, data: policy };
  }, {
    body: StaticPageModel.createPolicyBody,
  })
  .patch("/policies/:id", async ({ params: { id }, body }) => {
    const policy = await StaticPageService.updatePolicy(id, body as any);
    if (!policy) return status(404, { success: false as const, error: "Policy not found" });
    return { success: true as const, data: policy };
  }, {
    body: StaticPageModel.updatePolicyBody,
  })
  .delete("/policies/:id", async ({ params: { id } }) => {
    await StaticPageService.deletePolicy(id);
    return { success: true as const, message: "Policy deleted" };
  });
