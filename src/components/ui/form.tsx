import * as React from "react";
import { Controller, ControllerProps, FieldPath, FieldValues, FormProvider, useFormContext } from "react-hook-form";

import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { Label } from "./label";

/**
 * Form context for managing form field information
 */
type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

/**
 * Form field context provider
 */
const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);

/**
 * Form field component that provides context for form fields
 */
const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

/**
 * Custom hook to access form field information
 */
const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

/**
 * Form item context for managing form item information
 */
type FormItemContextValue = {
  id: string;
};

/**
 * Form item context provider
 */
const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

/**
 * Form item component that provides context for form items
 */
const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const id = React.useId();

    return (
      <FormItemContext.Provider value={{ id }}>
        <div ref={ref} className={cn("space-y-2", className)} {...props} />
      </FormItemContext.Provider>
    );
  },
);
FormItem.displayName = "FormItem";

/**
 * Form label component with error state support
 */
import { Label as LabelPrimitive } from "./label"; // Add this import statement

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField();

  return <LabelPrimitive ref={ref} className={cn(error && "text-destructive", className)} htmlFor={formItemId} {...props} />;
});
FormLabel.displayName = "FormLabel";

/**
 * Form control component that handles form field rendering
 */
const FormControl = React.forwardRef<React.ElementRef<typeof Slot>, React.ComponentPropsWithoutRef<typeof Slot>>(
  ({ ...props }, ref) => {
    const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

    return (
      <Slot
        ref={ref}
        id={formItemId}
        aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
        aria-invalid={!!error}
        {...props}
      />
    );
  },
);
FormControl.displayName = "FormControl";

/**
 * Form description component for additional field information
 */
const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    const { formDescriptionId } = useFormField();

    return <p ref={ref} id={formDescriptionId} className={cn("text-sm text-muted-foreground", className)} {...props} />;
  },
);
FormDescription.displayName = "FormDescription";

/**
 * Form message component for displaying validation errors
 */
const FormMessage = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => {
    const { error, formMessageId } = useFormField();
    const body = error ? String(error?.message) : children;

    if (!body) {
      return null;
    }

    return (
      <p ref={ref} id={formMessageId} className={cn("text-sm font-medium text-destructive", className)} {...props}>
        {body}
      </p>
    );
  },
);
FormMessage.displayName = "FormMessage";

export { useFormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField };
