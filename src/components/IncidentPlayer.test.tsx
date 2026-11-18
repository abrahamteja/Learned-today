// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { getLevel } from "@/content/levels";
import { IncidentPlayer } from "./IncidentPlayer";

const level = getLevel("infra-disk-full")!;

afterEach(cleanup);

describe("IncidentPlayer", () => {
  it("shows the alert, full health and no time spent", () => {
    render(<IncidentPlayer level={level} />);
    expect(screen.getByRole("heading", { level: 1, name: "api-1: disk 97% full" })).toBeTruthy();
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("60");
    expect(screen.getByTestId("elapsed").textContent).toBe("0 min");
  });

  it("reveals a clue and charges its time", () => {
    render(<IncidentPlayer level={level} />);
    fireEvent.click(screen.getByRole("button", { name: /API settings/ }));
    expect(screen.getByText(/LOG_LEVEL=debug/)).toBeTruthy();
    expect(screen.getByTestId("elapsed").textContent).toBe("1 min");
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("58");
  });

  it("shows feedback for a wrong move and disables it", () => {
    render(<IncidentPlayer level={level} />);
    const restart = screen.getByRole("button", { name: /Restart the API/ });
    fireEvent.click(restart);
    expect(screen.getAllByText(/disk is still 97% full and uploads keep failing/).length).toBeGreaterThan(0);
    expect((restart as HTMLButtonElement).disabled).toBe(true);
  });

  it("ends with a score, the root cause and the lesson, and can restart", () => {
    render(<IncidentPlayer level={level} />);
    fireEvent.click(screen.getByRole("button", { name: /Turn debug logging off/ }));
    expect(screen.getByText("Resolved")).toBeTruthy();
    expect(screen.getByText("100")).toBeTruthy();
    expect(screen.getByText(level.rootCause.summary)).toBeTruthy();
    expect(screen.getByText(level.lesson)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(screen.getByRole("heading", { name: "Investigate" })).toBeTruthy();
  });
});
