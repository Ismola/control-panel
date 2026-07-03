import { describe, expect, it } from "vitest";
import { renderTemplate } from "../src/services/template.js";

describe("renderTemplate", () => {
    it("replaces variables", () => {
        const result = renderTemplate("hello {{name}}", { name: "dev" });
        expect(result).toBe("hello dev");
    });
});
