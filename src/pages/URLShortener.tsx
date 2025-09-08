import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, ExternalLink, CheckCircle2, AlertCircle, Link as LinkIcon } from "lucide-react";
import { createShortenedUrl, getFullShortUrl, type ShortenedUrl } from "@/lib/urlShortener";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function URLShortener() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [customShortCode, setCustomShortCode] = useState("");
  const [validityMinutes, setValidityMinutes] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ShortenedUrl | null>(null);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      // Simulate API call delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const response = createShortenedUrl(
        originalUrl.trim(),
        customShortCode.trim() || undefined,
        validityMinutes
      );

      if ('error' in response) {
        setError(response.error);
      } else {
        setResult(response);
        setOriginalUrl("");
        setCustomShortCode("");
        setValidityMinutes(30);
        toast({
          title: "URL shortened successfully!",
          description: "Your short URL is ready to use.",
        });
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard!",
        description: "The short URL has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the URL manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4">
          <LinkIcon className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-bold text-foreground">URL Shortener</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Create short, memorable links that are easy to share. Monitor your links with detailed analytics.
        </p>
      </div>

      {/* URL Shortening Form */}
      <Card className="shadow-custom animate-slide-up">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Shorten Your URL</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Original URL Input */}
            <div className="space-y-2">
              <Label htmlFor="originalUrl" className="text-base font-medium">
                Original URL *
              </Label>
              <Input
                id="originalUrl"
                type="url"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                placeholder="https://example.com/very-long-url"
                required
                className="h-12 text-base"
                disabled={isLoading}
              />
              <p className="text-sm text-muted-foreground">
                Enter the URL you want to shorten (must include http:// or https://)
              </p>
            </div>

            {/* Custom Shortcode Input */}
            <div className="space-y-2">
              <Label htmlFor="customShortCode" className="text-base font-medium">
                Custom Shortcode (Optional)
              </Label>
              <Input
                id="customShortCode"
                type="text"
                value={customShortCode}
                onChange={(e) => setCustomShortCode(e.target.value)}
                placeholder="my-custom-code"
                className="h-12 text-base"
                disabled={isLoading}
              />
              <p className="text-sm text-muted-foreground">
                3-20 alphanumeric characters. Leave blank for auto-generation.
              </p>
            </div>

            {/* Validity Period Input */}
            <div className="space-y-2">
              <Label htmlFor="validityMinutes" className="text-base font-medium">
                Validity Period (Minutes)
              </Label>
              <Input
                id="validityMinutes"
                type="number"
                min="1"
                max="525600"
                value={validityMinutes}
                onChange={(e) => setValidityMinutes(parseInt(e.target.value) || 30)}
                className="h-12 text-base"
                disabled={isLoading}
              />
              <p className="text-sm text-muted-foreground">
                How long should this short URL remain active? (Default: 30 minutes)
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || !originalUrl.trim()}
              className="w-full h-12 text-base font-medium gradient-primary hover:opacity-90 transition-all"
            >
              {isLoading ? "Shortening..." : "Shorten URL"}
            </Button>
          </form>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mt-6 animate-slide-up">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Result Card */}
      {result && (
        <Card className="shadow-custom animate-slide-up border-success/20 bg-success/5">
          <CardHeader>
            <CardTitle className="text-xl text-success flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              URL Shortened Successfully!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Short URL */}
            <div className="space-y-2">
              <Label className="text-base font-medium">Your Short URL</Label>
              <div className="flex gap-2">
                <Input
                  value={getFullShortUrl(result.shortCode)}
                  readOnly
                  className="h-12 text-base font-mono bg-accent"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(getFullShortUrl(result.shortCode))}
                  className="h-12 w-12 shrink-0"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Original URL */}
            <div className="space-y-2">
              <Label className="text-base font-medium">Original URL</Label>
              <div className="flex gap-2">
                <Input
                  value={result.originalUrl}
                  readOnly
                  className="h-12 text-base bg-muted"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(result.originalUrl, '_blank')}
                  className="h-12 w-12 shrink-0"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* URL Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="text-base font-medium">
                  {result.createdAt.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Expires</p>
                <p className="text-base font-medium">
                  {result.expiryDate.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Validity</p>
                <p className="text-base font-medium">
                  {result.validityMinutes} minutes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <Card className="text-center p-6 hover:shadow-custom transition-all duration-300">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <LinkIcon className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Fast & Reliable</h3>
          <p className="text-muted-foreground">
            Generate short URLs instantly with 99.9% uptime guarantee.
          </p>
        </Card>

        <Card className="text-center p-6 hover:shadow-custom transition-all duration-300">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Custom Shortcodes</h3>
          <p className="text-muted-foreground">
            Create memorable, branded short URLs with custom shortcodes.
          </p>
        </Card>

        <Card className="text-center p-6 hover:shadow-custom transition-all duration-300">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Expiry Control</h3>
          <p className="text-muted-foreground">
            Set custom expiration times to control link accessibility.
          </p>
        </Card>
      </div>
    </div>
  );
}