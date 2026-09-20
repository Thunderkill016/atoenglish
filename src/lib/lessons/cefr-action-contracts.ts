export const CEFR_DESCRIPTOR_SOURCE = {
  title: "Council of Europe — CEFR Companion Volume (2020)",
  descriptorIndexUrl:
    "https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-descriptors",
} as const;

export type CefrMode =
  | "reception"
  | "production"
  | "interaction"
  | "mediation"
  | "online-interaction";

export interface CefrActionContract {
  unitId: string;
  level: "Pre-A1" | "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  mode: CefrMode;
  /**
   * Product-facing Vietnamese paraphrase of the official descriptor.
   * Keep the official Council of Europe source URL beside it for traceability.
   */
  descriptorVi: string;
  actionTaskVi: string;
  successCriteriaVi: string[];
  source: typeof CEFR_DESCRIPTOR_SOURCE;
  /**
   * A lesson-completion score is not automatically CEFR mastery evidence.
   * This field makes that boundary explicit until a matching assessment exists.
   */
  masteryEvidence: "not-yet-validated";
}

const contracts: Record<string, CefrActionContract> = {
  "unit-1": {
    unitId: "unit-1",
    level: "A1",
    mode: "interaction",
    descriptorVi:
      "Có thể hỏi và trả lời các câu hỏi đơn giản về chủ đề rất quen thuộc hoặc nhu cầu trực tiếp.",
    actionTaskVi:
      "Trong ngày đầu đi làm, hãy chào một đồng nghiệp mới, tự giới thiệu, trao đổi ít nhất một thông tin cá nhân đơn giản và kết thúc cuộc gặp lịch sự.",
    successCriteriaVi: [
      "Mở đầu bằng một lời chào phù hợp với tình huống.",
      "Nói được tên và ít nhất một thông tin cá nhân đơn giản như nơi mình đến từ.",
      "Hỏi hoặc trả lời được ít nhất một câu hỏi đơn giản với người đối thoại.",
      "Kết thúc cuộc gặp bằng một câu lịch sự phù hợp.",
    ],
    source: CEFR_DESCRIPTOR_SOURCE,
    masteryEvidence: "not-yet-validated",
  },
};

export const CEFR_ACTION_CONTRACT_REQUIRED_UNIT_IDS = ["unit-1"] as const;

export function getCefrActionContract(unitId: string): CefrActionContract | undefined {
  return contracts[unitId];
}

export function validateCefrActionContract(contract: CefrActionContract | undefined): string[] {
  if (!contract) return ["thiếu CEFR action contract"];

  const violations: string[] = [];
  if (!contract.level) violations.push("thiếu CEFR level");
  if (!contract.mode) violations.push("thiếu communicative mode");
  if (contract.descriptorVi.trim().length < 30) violations.push("descriptor quá ngắn");
  if (contract.actionTaskVi.trim().length < 50) violations.push("action task quá ngắn");
  if (contract.successCriteriaVi.length < 3) violations.push("cần ít nhất 3 success criteria");
  if (!contract.source.descriptorIndexUrl.startsWith("https://www.coe.int/")) {
    violations.push("descriptor phải truy vết về nguồn chính thức Council of Europe");
  }
  if (contract.masteryEvidence !== "not-yet-validated") {
    violations.push("không được tự tuyên bố CEFR mastery khi chưa có assessment evidence hợp lệ");
  }

  return violations;
}
