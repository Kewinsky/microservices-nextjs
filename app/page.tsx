import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Shield,
  Database,
  FileText,
  Zap,
  Lock,
  Server,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-muted/20">
      {/* Navigation */}
      <nav className="w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Server className="h-5 w-5" />
            <span>Microservices Platform</span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            {hasEnvVars && (
              <Suspense>
                <AuthButton />
              </Suspense>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
        <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm bg-muted/50">
            <Zap className="h-3 w-3 mr-2" />
            <span>Modern microservices architecture</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Microservices System
            <br />
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              with API Gateway
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl">
            A comprehensive solution consisting of three independent
            microservices communicating through a central API Gateway. Built
            with Next.js, Supabase, and Docker.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button asChild size="lg" className="text-base">
              <Link href="/auth/sign-up">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base">
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Features</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            The system offers a full set of features for data management,
            authorization, and activity monitoring
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {/* Auth Service Card */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Authorization Microservice</CardTitle>
              <CardDescription>
                Secure user registration and login with JWT token generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  User registration
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Login with JWT
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Token verification
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* CRUD Service Card */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>CRUD Microservice</CardTitle>
              <CardDescription>
                Full Create, Read, Update, Delete operations on data with
                authorization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Record creation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Read and filtering
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Update and deletion
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Logging Service Card */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Logging Microservice</CardTitle>
              <CardDescription>
                Recording and viewing all user and system actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Action logging
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Activity history
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Log filtering
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 bg-muted/30 rounded-3xl my-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              System Architecture
            </h2>
            <p className="text-muted-foreground text-lg">
              Central API Gateway manages communication between the client and
              microservices
            </p>
          </div>

          <Card className="bg-background/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                API Gateway
              </CardTitle>
              <CardDescription>
                Central communication point providing routing, authorization,
                and request logging
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Lock className="h-4 w-4 text-primary" />
                  <span className="text-sm">
                    JWT token authorization and verification
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="text-sm">
                    Request routing to appropriate microservices
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm">Logging of all operations</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-border/40 mt-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground text-center sm:text-left">
              © 2025 Microservices Platform. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
