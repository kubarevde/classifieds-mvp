/** @vitest-environment jsdom */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatTile } from "../StatTile";

describe("StatTile", () => {
  it("renders label, value, and delta when not loading", () => {
    render(<StatTile label="Просмотры" value="1 234" delta={12} trend="up" />);
    expect(screen.getByText("Просмотры")).toBeInTheDocument();
    expect(screen.getByText("1 234")).toBeInTheDocument();
    expect(screen.getByText("+12")).toBeInTheDocument();
  });

  it("renders loading state instead of the value", () => {
    render(<StatTile label="Выручка" value="999" loading />);
    expect(screen.queryByText("999")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Загрузка")).toBeInTheDocument();
  });
});
