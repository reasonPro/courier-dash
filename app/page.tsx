import { redirect } from "next/navigation";

export default function HomePage() {
  // Миттєво перекидаємо всіх, хто зайшов на головну, у дашборд
  redirect("/work");
}