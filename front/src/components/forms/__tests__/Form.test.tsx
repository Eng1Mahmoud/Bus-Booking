import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { z } from "zod";

import { Form } from "../Form";
import { InputField } from "../InputField";

/**
 * These pin down the two mistakes the form primitives shipped with, both of
 * which left validation messages invisible while the type checker and the
 * build stayed green:
 *
 *   - spreading `register()` onto MUI's TextField sends the ref to the root
 *     <div> rather than the input, so react-hook-form never reads the value
 *   - `formState` from `useFormContext()` is a proxy that only re-renders the
 *     component that called `useForm`, so a child never sees a new error
 *
 * If either regresses, "Required" stops appearing and these go red.
 */
const schema = z.object({
  email: z.string().min(1, "Required").email("Invalid email address"),
});

const renderForm = (onSubmit = vi.fn()) => {
  render(
    <Form
      schema={schema}
      defaultValues={{ email: "" }}
      onSubmit={onSubmit}
      submitLabel="Send"
    >
      <InputField name="email" label="Email" />
    </Form>,
  );
  return onSubmit;
};

describe("Form", () => {
  it("shows the schema's message for an empty required field", async () => {
    const user = userEvent.setup();
    const onSubmit = renderForm();

    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByText("Required")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows a format error and still refuses to submit", async () => {
    const user = userEvent.setup();
    const onSubmit = renderForm();

    await user.type(screen.getByLabelText("Email"), "not-an-email");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByText("Invalid email address")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits the typed values once they are valid", async () => {
    const user = userEvent.setup();
    const onSubmit = renderForm();

    await user.type(screen.getByLabelText("Email"), "rider@example.com");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({
      email: "rider@example.com",
    });
  });

  it("surfaces a thrown error instead of swallowing it", async () => {
    const user = userEvent.setup();
    // Six of the eight original forms had an empty .catch(() => {}), so a
    // failure looked identical to success.
    renderForm(vi.fn().mockRejectedValue(new Error("Server unavailable")));

    await user.type(screen.getByLabelText("Email"), "rider@example.com");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByText("Server unavailable")).toBeInTheDocument();
  });
});
