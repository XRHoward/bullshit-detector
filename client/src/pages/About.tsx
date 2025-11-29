import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Mail, Shield, Cpu } from "lucide-react";
import { Link } from "wouter";

export default function About() {
  const [language, setLanguage] = useState<"no" | "en">("no");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/">
                <a className="text-3xl font-bold text-foreground hover:text-foreground/80 transition-colors">
                  {language === "no" ? "Bullshit-detektor" : "Bullshit Detector"}
                </a>
              </Link>
              <p className="text-muted-foreground mt-1">
                {language === "no" 
                  ? "Oppdag og fjern tomme fraser og buzzwords" 
                  : "Detect and eliminate empty phrases and buzzwords"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={language === "no" ? "default" : "outline"}
                onClick={() => setLanguage("no")}
                size="sm"
              >
                Norsk
              </Button>
              <Button
                variant={language === "en" ? "default" : "outline"}
                onClick={() => setLanguage("en")}
                size="sm"
              >
                English
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* About Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Info className="h-6 w-6" />
                {language === "no" ? "Om Bullshit Detector" : "About Bullshit Detector"}
              </CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              {language === "no" ? (
                <>
                  <p className="text-base leading-relaxed">
                    Bullshit Detector er et vibe-kodet nettbasert verktøy som hjelper deg å avsløre uklart språk, 
                    oppblåste formuleringer og typiske "bullshit-mønstre" i tekst. Målet er å gjøre det enklere 
                    å skrive presist, konkret og forståelig.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-base leading-relaxed">
                    Bullshit Detector is a vibe-coded web-based tool that helps you uncover unclear language, 
                    inflated formulations, and typical "bullshit patterns" in text. The goal is to make it easier 
                    to write precisely, concretely, and understandably.
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Technology Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Cpu className="h-6 w-6" />
                {language === "no" ? "Teknologi" : "Technology"}
              </CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              {language === "no" ? (
                <>
                  <p className="text-base leading-relaxed mb-4">
                    Bullshit Detector er bygget med moderne webtekn--snip--, og kostnadseffektiv AI-modell som gir raske og nøyaktige analyser.
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2 text-sm">
                    <div>
                      <h4 className="font-semibold mb-2">Frontend</h4>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>React 19 + TypeScript</li>
                        <li>Tailwind CSS 4</li>
                        <li>tRPC (type-safe API)</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Backend</h4>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Node.js 22 + Express</li>
                        <li>MySQL/TiDB database</li>
                        <li>Drizzle ORM</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">AI/LLM</h4>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Google Gemini 2.5 Flash</li>
                        <li>Structured JSON output</li>
                        <li>Flerspråklig analyse</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Hosting</h4>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Manus Platform</li>
                        <li>Cloudflare CDN</li>
                        <li>Automatisk SSL/HTTPS</li>
                      </ul>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-base leading-relaxed mb-4">
                    Bullshit Detector is built with modern web technologies and powered by Google's Gemini 2.5 Flash, 
                    a fast and cost-effective AI model that provides quick and accurate analyses.
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2 text-sm">
                    <div>
                      <h4 className="font-semibold mb-2">Frontend</h4>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>React 19 + TypeScript</li>
                        <li>Tailwind CSS 4</li>
                        <li>tRPC (type-safe API)</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Backend</h4>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Node.js 22 + Express</li>
                        <li>MySQL/TiDB database</li>
                        <li>Drizzle ORM</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">AI/LLM</h4>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Google Gemini 2.5 Flash</li>
                        <li>Structured JSON output</li>
                        <li>Multilingual analysis</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Hosting</h4>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Manus Platform</li>
                        <li>Cloudflare CDN</li>
                        <li>Automatic SSL/HTTPS</li>
                      </ul>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Privacy Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Shield className="h-6 w-6" />
                {language === "no" ? "Personvern" : "Privacy"}
              </CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              {language === "no" ? (
                <>
                  <p className="text-base leading-relaxed">
                    Tjenesten lagrer ikke teksten du legger inn, og vi sporer deg ikke på noen måte. 
                    For å forbedre kvaliteten på verktøyet lagrer vi kun anonymiserte tellinger av ord, 
                    uten noen form for tilknytning til deg eller teksten du skrev. Ingen persondata, 
                    ingen logging av innhold.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-base leading-relaxed">
                    The service does not store the text you submit, and we do not track you in any way. 
                    To improve the quality of the tool, we only store anonymized word counts, without any 
                    connection to you or the text you wrote. No personal data, no content logging.
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Contact Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Mail className="h-6 w-6" />
                {language === "no" ? "Kontakt" : "Contact"}
              </CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              {language === "no" ? (
                <>
                  <p className="text-base leading-relaxed">
                    Bullshit Detector er utviklet av{" "}
                    <a href="https://www.fortolker.no" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
                      Fortolker AS
                    </a>.
                  </p>
                  <p className="text-base leading-relaxed">
                    Har du spørsmål eller innspill, kontakt oss gjerne på{" "}
                    <a href="mailto:hei@fortolker.no" className="text-primary hover:underline">
                      hei@fortolker.no
                    </a>
                  </p>
                </>
              ) : (
                <>
                  <p className="text-base leading-relaxed">
                    Bullshit Detector is developed by{" "}
                    <a href="https://www.fortolker.no" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
                      Fortolker AS
                    </a>.
                  </p>
                  <p className="text-base leading-relaxed">
                    If you have questions or feedback, feel free to contact us at{" "}
                    <a href="mailto:hei@fortolker.no" className="text-primary hover:underline">
                      hei@fortolker.no
                    </a>
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Back to Home */}
          <div className="text-center pt-4">
            <Link href="/">
              <Button variant="outline" size="lg">
                {language === "no" ? "Tilbake til forsiden" : "Back to home"}
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2025 Fortolker AS. {language === "no" ? "Alle rettigheter reservert." : "All rights reserved."}</p>
        </div>
      </footer>
    </div>
  );
}
