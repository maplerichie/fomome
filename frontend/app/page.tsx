"use client";
import Home from "@/components/home";
import styles from "./page.module.css";
import "./globals.css";

export default function Index() {
  return (
    <main className={styles.main}>
      <Home></Home>
    </main>
  );
}
