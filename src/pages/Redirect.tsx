import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ExternalLink, Clock } from "lucide-react";
import { 
  getShortenedUrl, 
  recordClick, 
  isUrlExpired,
  type ShortenedUrl 
} from "@/lib/urlShortener";

export default function Redirect() {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [urlData, setUrlData] = useState<ShortenedUrl | null>(null);
  const [status, setStatus] = useState<'loading' | 'found' | 'expired' | 'not-found'>('loading');
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!shortCode) {
      setStatus('not-found');
      return;
    }

    const url = getShortenedUrl(shortCode);
    
    if (!url) {
      setStatus('not-found');
      return;
    }

    setUrlData(url);

    if (isUrlExpired(url)) {
      setStatus('expired');
      return;
    }

    setStatus('found');
    recordClick(shortCode);

    // Start countdown and redirect
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          window.location.href = url.originalUrl;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [shortCode]);

  const handleDirectRedirect = () => {
    if (urlData) {
      window.location.href = urlData.originalUrl;
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md shadow-custom">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Looking up your URL...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'not-found') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md shadow-custom border-destructive/20">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">URL Not Found</h1>
            <p className="text-muted-foreground">
              The short URL you're looking for doesn't exist or may have been removed.
            </p>
            <Button 
              onClick={() => window.location.href = '/'}
              className="w-full gradient-primary"
            >
              Create New Short URL
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'expired') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md shadow-custom border-warning/20">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8 text-warning" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">URL Expired</h1>
            <p className="text-muted-foreground">
              This short URL has expired and is no longer accessible.
            </p>
            {urlData && (
              <div className="p-4 bg-accent rounded-lg text-left">
                <p className="text-sm text-muted-foreground mb-1">Original URL:</p>
                <p className="text-sm font-mono break-all text-foreground">
                  {urlData.originalUrl}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Expired: {urlData.expiryDate.toLocaleString()}
                </p>
              </div>
            )}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/'}
                className="flex-1"
              >
                Create New URL
              </Button>
              {urlData && (
                <Button 
                  variant="outline"
                  onClick={() => window.open(urlData.originalUrl, '_blank')}
                  className="flex-1"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Visit Original
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // status === 'found'
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-md shadow-custom border-success/20">
        <CardContent className="p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
            <ExternalLink className="w-8 h-8 text-success" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Redirecting...</h1>
          <p className="text-muted-foreground">
            You'll be redirected in <span className="font-bold text-primary">{countdown}</span> seconds
          </p>
          
          {urlData && (
            <div className="p-4 bg-accent rounded-lg text-left">
              <p className="text-sm text-muted-foreground mb-1">Destination:</p>
              <p className="text-sm font-mono break-all text-foreground">
                {urlData.originalUrl}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={handleDirectRedirect}
              className="flex-1 gradient-primary"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Go Now
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}