import { prisma } from "../../lib/prisma";
import type { StaticPageModel } from "./model";

export abstract class StaticPageService {
  // --- Pages ---
  static async listPages() {
    return prisma.page.findMany({
      orderBy: { position: "asc" },
    });
  }

  static async getPageBySlug(slug: string) {
    return prisma.page.findUnique({
      where: { slug },
    });
  }

  static async createPage(body: StaticPageModel["createPageBody"]) {
    return prisma.page.create({
      data: body,
    });
  }

  static async updatePage(id: string, body: StaticPageModel["updatePageBody"]) {
    return prisma.page.update({
      where: { id },
      data: body,
    });
  }

  static async deletePage(id: string) {
    await prisma.page.delete({ where: { id } });
    return true;
  }

  // --- Policies ---
  static async listPolicies() {
    return prisma.policy.findMany({
      orderBy: { createdAt: "asc" },
    });
  }

  static async getPolicyBySlug(slug: string) {
    return prisma.policy.findUnique({
      where: { slug },
    });
  }

  static async createPolicy(body: StaticPageModel["createPolicyBody"]) {
    return prisma.policy.create({
      data: body,
    });
  }

  static async updatePolicy(id: string, body: StaticPageModel["updatePolicyBody"]) {
    return prisma.policy.update({
      where: { id },
      data: body,
    });
  }

  static async deletePolicy(id: string) {
    await prisma.policy.delete({ where: { id } });
    return true;
  }
}
