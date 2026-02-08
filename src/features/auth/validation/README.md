# Auth Validation Schemas

This directory contains Zod validation schemas for authentication forms following clean architecture principles.

## Structure

- **Base schemas** (`@/shared/validation/fields.ts`): Reusable field schemas (email, password, username)
- **Auth schemas** (`authSchemas.ts`): Feature-specific schemas (login, register, OTP)
- **Error messages** (`@/shared/validation/errors.ts`): Centralized error message keys

## Usage Examples

### With React Hook Form

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "./authSchemas";
import { useTranslation } from "react-i18next";

const LoginScreen = () => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    // data is type-safe and validated
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("email")} />
      {errors.email && <span>{t(errors.email.message || "")}</span>}
      
      <input {...register("password")} type="password" />
      {errors.password && <span>{t(errors.password.message || "")}</span>}
      
      <button type="submit">Login</button>
    </form>
  );
};
```

### Manual Validation

```typescript
import { loginSchema } from "./authSchemas";

const result = loginSchema.safeParse({
  email: "user@example.com",
  password: "password123",
});

if (result.success) {
  // Type-safe data
  const data: LoginFormData = result.data;
} else {
  // Handle errors
  console.error(result.error);
}
```

## Best Practices

1. **Reuse base schemas**: Use `emailField`, `passwordField`, `usernameField` from `@/shared/validation/fields`
2. **Use superRefine for cross-field validation**: See `registerSchema` for password matching example
3. **Infer types from schemas**: Use `z.infer<typeof schema>` for type safety
4. **Centralize error messages**: All error messages are in i18n files under `validation.*`
5. **Keep validation simple**: Complex validation should be on the backend

