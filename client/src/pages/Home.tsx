import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, TrendingUp, Lightbulb, FileText, Upload, Info } from "lucide-react";
import { Link } from "wouter";
import { APP_TITLE } from "@/const";
import { toast } from "sonner";

export default function Home() {
  const [text, setText] = useState("");
  const [language, setLanguage] = useState<"no" | "en">("no");
  const [result, setResult] = useState<{
    score: number;
    buzzwords: string[];
    suggestions: string[];
    explanation: string;
  } | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzeMutation = trpc.analysis.analyze.useMutation({
    onSuccess: (data) => {
      setResult(data);
      toast.success(language === "no" ? "Analyse fullført!" : "Analysis complete!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const analyzeDocumentMutation = trpc.analysis.analyzeDocument.useMutation({
    onSuccess: (data) => {
      setResult(data);
      toast.success(language === "no" ? "Dokument analysert!" : "Document analyzed!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const analyzeUrlMutation = trpc.analysis.analyzeUrl.useMutation({
    onSuccess: (data) => {
      setResult(data);
      toast.success(language === "no" ? "URL analysert!" : "URL analyzed!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { data: topBuzzwords } = trpc.analysis.topBuzzwords.useQuery({
    language: language,
    limit: 20,
  });

  const handleAnalyze = () => {
    if (text.length < 10) {
      toast.error(language === "no" ? "Teksten må være minst 10 tegn" : "Text must be at least 10 characters");
      return;
    }
    analyzeMutation.mutate({ text, language });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error(language === "no" ? "Filen er for stor (maks 10MB)" : "File is too large (max 10MB)");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error(language === "no" ? "Ugyldig filtype. Bruk PDF, Word eller TXT" : "Invalid file type. Use PDF, Word or TXT");
      return;
    }

    setUploadedFile(file);
    toast.success(language === "no" ? `${file.name} lastet opp` : `${file.name} uploaded`);
  };

  const handleAnalyzeDocument = async () => {
    if (!uploadedFile) {
      toast.error(language === "no" ? "Vennligst last opp et dokument først" : "Please upload a document first");
      return;
    }

    // Upload to temporary storage
    const formData = new FormData();
    formData.append("file", uploadedFile);

    try {
      // Create object URL for the file
      const fileUrl = URL.createObjectURL(uploadedFile);
      
      // For server-side processing, we need to upload to S3 first
      // Since we're using public procedure, we'll use a simple approach
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        
        // Convert base64 to blob URL that can be fetched
        const response = await fetch(base64);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        analyzeDocumentMutation.mutate({
          fileUrl: blobUrl,
          mimeType: uploadedFile.type,
          language,
        });
      };
      reader.readAsDataURL(uploadedFile);
    } catch (error) {
      toast.error(language === "no" ? "Feil ved opplasting" : "Upload error");
    }
  };

  const handleAnalyzeUrl = () => {
    if (!url) {
      toast.error(language === "no" ? "Vennligst skriv inn en URL" : "Please enter a URL");
      return;
    }

    try {
      new URL(url);
    } catch {
      toast.error(language === "no" ? "Ugyldig URL-format" : "Invalid URL format");
      return;
    }

    analyzeUrlMutation.mutate({ url, language });
  };

  const getScoreColor = (score: number) => {
    if (score <= 20) return "text-green-600 dark:text-green-400";
    if (score <= 40) return "text-lime-600 dark:text-lime-400";
    if (score <= 60) return "text-yellow-600 dark:text-yellow-400";
    if (score <= 80) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreLabel = (score: number) => {
    if (language === "no") {
      if (score <= 20) return "Utmerket - Klar og konkret";
      if (score <= 40) return "God - Noe buzzwords";
      if (score <= 60) return "Middels - Betydelig sjargong";
      if (score <= 80) return "Dårlig - Mye innholdsløst";
      return "Kritisk - Ekstremt høyt bullshit-nivå";
    } else {
      if (score <= 20) return "Excellent - Clear and concrete";
      if (score <= 40) return "Good - Some buzzwords";
      if (score <= 60) return "Medium - Significant jargon";
      if (score <= 80) return "Poor - Lots of empty content";
      return "Critical - Extremely high bullshit level";
    }
  };

  const isAnalyzing = analyzeMutation.isPending || analyzeDocumentMutation.isPending || analyzeUrlMutation.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {language === "no" ? "Bullshit-detektor" : "Bullshit Detector"}
              </h1>
              <p className="text-muted-foreground mt-1">
                {language === "no" 
                  ? "Oppdag og fjern tomme fraser og buzzwords" 
                  : "Detect and eliminate empty phrases and buzzwords"}
              </p>
            </div>
            <div className="flex gap-3 items-center">
              <Link href={language === "no" ? "/om" : "/about"}>
                <a className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-3">
                  <Info className="h-4 w-4" />
                  {language === "no" ? "Om" : "About"}
                </a>
              </Link>
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
        </div>
      </header>

      <main className="container py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Analysis Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {language === "no" ? "Analyser tekst" : "Analyze text"}
                </CardTitle>
                <CardDescription>
                  {language === "no" 
                    ? "Lim inn tekst, skriv inn URL eller last opp et dokument" 
                    : "Paste text, enter URL or upload a document"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="text" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="text">
                      {language === "no" ? "Tekst" : "Text"}
                    </TabsTrigger>
                    <TabsTrigger value="url">
                      URL
                    </TabsTrigger>
                    <TabsTrigger value="document">
                      {language === "no" ? "Dokument" : "Document"}
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="text" className="space-y-4">
                    <Textarea
                      placeholder={language === "no" 
                        ? "Skriv eller lim inn tekst her..." 
                        : "Write or paste text here..."}
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="min-h-[200px] resize-y"
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {text.length} {language === "no" ? "tegn" : "characters"}
                      </span>
                      <Button 
                        onClick={handleAnalyze} 
                        disabled={isAnalyzing || text.length < 10}
                        size="lg"
                      >
                        {isAnalyzing 
                          ? (language === "no" ? "Analyserer..." : "Analyzing...") 
                          : (language === "no" ? "Analyser" : "Analyze")}
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="url" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          {language === "no" ? "Skriv inn URL" : "Enter URL"}
                        </label>
                        <input
                          type="url"
                          placeholder={language === "no" 
                            ? "https://eksempel.no/artikkel" 
                            : "https://example.com/article"}
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          className="w-full px-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          {language === "no" 
                            ? "Analyser innholdet fra en nettside, blogg eller artikkel" 
                            : "Analyze content from a website, blog or article"}
                        </p>
                      </div>
                      <div className="flex justify-end">
                        <Button 
                          onClick={handleAnalyzeUrl} 
                          disabled={isAnalyzing || !url}
                          size="lg"
                        >
                          {isAnalyzing 
                            ? (language === "no" ? "Analyserer..." : "Analyzing...") 
                            : (language === "no" ? "Analyser URL" : "Analyze URL")}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="document" className="space-y-4">
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground mb-4">
                        {language === "no" 
                          ? "Last opp PDF, Word eller tekstfil (maks 10MB)" 
                          : "Upload PDF, Word or text file (max 10MB)"}
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {language === "no" ? "Velg fil" : "Choose file"}
                      </Button>
                      {uploadedFile && (
                        <p className="text-sm text-foreground mt-4 font-medium">
                          {uploadedFile.name}
                        </p>
                      )}
                    </div>
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleAnalyzeDocument} 
                        disabled={isAnalyzing || !uploadedFile}
                        size="lg"
                      >
                        {isAnalyzing 
                          ? (language === "no" ? "Analyserer..." : "Analyzing...") 
                          : (language === "no" ? "Analyser dokument" : "Analyze document")}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Results */}
            {result && (
              <div className="space-y-6">
                {/* Score Card */}
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Bullshit Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className={`text-6xl font-bold ${getScoreColor(result.score)}`}>
                          {result.score}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {language === "no" ? "av 100" : "out of 100"}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={result.score > 60 ? "destructive" : "secondary"} className="text-base px-4 py-2">
                          {getScoreLabel(result.score)}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          result.score <= 20 ? "bg-green-500" :
                          result.score <= 40 ? "bg-lime-500" :
                          result.score <= 60 ? "bg-yellow-500" :
                          result.score <= 80 ? "bg-orange-500" : "bg-red-500"
                        }`}
                        style={{ width: `${result.score}%` }}
                      />
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-4">
                      {result.explanation}
                    </p>
                  </CardContent>
                </Card>

                {/* Buzzwords & Suggestions */}
                <Tabs defaultValue="buzzwords" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="buzzwords">
                      {language === "no" ? "Buzzwords funnet" : "Buzzwords found"} ({result.buzzwords.length})
                    </TabsTrigger>
                    <TabsTrigger value="suggestions">
                      {language === "no" ? "Forbedringsforslag" : "Suggestions"} ({result.suggestions.length})
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="buzzwords" className="mt-4">
                    <Card>
                      <CardContent className="pt-6">
                        {result.buzzwords.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {result.buzzwords.map((word, idx) => (
                              <Badge key={idx} variant="destructive" className="text-sm">
                                {word}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-center py-4">
                            {language === "no" 
                              ? "Ingen buzzwords funnet! 🎉" 
                              : "No buzzwords found! 🎉"}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="suggestions" className="mt-4">
                    <Card>
                      <CardContent className="pt-6">
                        {result.suggestions.length > 0 ? (
                          <ul className="space-y-3">
                            {result.suggestions.map((suggestion, idx) => (
                              <li key={idx} className="flex gap-3">
                                <Lightbulb className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                <span className="text-sm">{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-muted-foreground text-center py-4">
                            {language === "no" 
                              ? "Ingen forbedringsforslag" 
                              : "No suggestions"}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>

          {/* Sidebar - Top Buzzwords */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  {language === "no" ? "Topp Buzzwords" : "Top Buzzwords"}
                </CardTitle>
                <CardDescription>
                  {language === "no" 
                    ? "Mest brukte buzzwords på tvers av alle analyser" 
                    : "Most used buzzwords across all analyses"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {topBuzzwords && topBuzzwords.length > 0 ? (
                  <div className="space-y-3">
                    {topBuzzwords.map((item, idx) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-muted-foreground w-6">
                            #{idx + 1}
                          </span>
                          <span className="font-medium">{item.word}</span>
                        </div>
                        <Badge variant="secondary">{item.count}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    {language === "no" 
                      ? "Ingen data ennå" 
                      : "No data yet"}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer with Ad placeholder */}
      <footer className="border-t mt-16">
        <div className="container py-8">
          <div className="bg-muted rounded-lg p-8 text-center">
            <p className="text-muted-foreground text-sm mb-2">
              {language === "no" ? "Annonseplass" : "Advertisement"}
            </p>
            <div className="h-24 flex items-center justify-center border-2 border-dashed border-border rounded">
              <span className="text-muted-foreground">Google Ads</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
