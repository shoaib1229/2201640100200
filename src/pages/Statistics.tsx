import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  BarChart3, 
  Clock, 
  Copy, 
  ExternalLink, 
  Mouse, 
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Search
} from "lucide-react";
import { 
  getShortenedUrls, 
  getFullShortUrl, 
  isUrlExpired,
  cleanupExpiredUrls,
  type ShortenedUrl 
} from "@/lib/urlShortener";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function Statistics() {
  const [urls, setUrls] = useState<ShortenedUrl[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Clean up expired URLs on load
    cleanupExpiredUrls();
    setUrls(getShortenedUrls());
  }, []);

  const filteredUrls = urls.filter(url => 
    url.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
    url.shortCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalClicks = urls.reduce((sum, url) => sum + url.clicks.length, 0);
  const activeUrls = urls.filter(url => !isUrlExpired(url)).length;
  const expiredUrls = urls.length - activeUrls;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard!",
        description: "The URL has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the URL manually.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getTimeUntilExpiry = (expiryDate: Date) => {
    const now = new Date();
    const timeDiff = expiryDate.getTime() - now.getTime();
    
    if (timeDiff <= 0) return "Expired";
    
    const minutes = Math.floor(timeDiff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4">
          <BarChart3 className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-bold text-foreground">URL Statistics</h1>
        <p className="text-xl text-muted-foreground">
          Monitor and analyze your shortened URLs performance
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-custom">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total URLs</p>
                <p className="text-3xl font-bold text-foreground">{urls.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-custom">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Clicks</p>
                <p className="text-3xl font-bold text-foreground">{totalClicks}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Mouse className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-custom">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active URLs</p>
                <p className="text-3xl font-bold text-success">{activeUrls}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-custom">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expired URLs</p>
                <p className="text-3xl font-bold text-warning">{expiredUrls}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="shadow-custom">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search URLs or shortcodes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        </CardContent>
      </Card>

      {/* URLs List */}
      <div className="space-y-4">
        {filteredUrls.length === 0 ? (
          <Card className="shadow-custom">
            <CardContent className="p-12 text-center">
              <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {urls.length === 0 ? "No URLs Created Yet" : "No Matching URLs Found"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {urls.length === 0 
                  ? "Start by creating your first shortened URL!"
                  : "Try adjusting your search terms."
                }
              </p>
              {urls.length === 0 && (
                <Button 
                  onClick={() => window.location.href = '/'}
                  className="gradient-primary"
                >
                  Create Your First URL
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredUrls.map((url) => {
            const isExpired = isUrlExpired(url);
            const shortUrl = getFullShortUrl(url.shortCode);
            
            return (
              <Card key={url.id} className={cn(
                "shadow-custom transition-all duration-200 hover:shadow-strong",
                isExpired && "opacity-75 border-warning/30"
              )}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* URL Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-foreground truncate">
                              {shortUrl}
                            </h3>
                            <Badge variant={isExpired ? "destructive" : "default"}>
                              {isExpired ? "Expired" : "Active"}
                            </Badge>
                            {url.customShortCode && (
                              <Badge variant="secondary">Custom</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {url.originalUrl}
                          </p>
                        </div>
                      </div>

                      {/* URL Actions */}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(shortUrl)}
                          className="h-8"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy Short URL
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(url.originalUrl, '_blank')}
                          className="h-8"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Open Original
                        </Button>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="lg:w-80 space-y-4">
                      {/* Click Stats */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-accent rounded-lg">
                          <p className="text-2xl font-bold text-primary">{url.clicks.length}</p>
                          <p className="text-sm text-muted-foreground">Total Clicks</p>
                        </div>
                        <div className="text-center p-3 bg-accent rounded-lg">
                          <p className="text-sm font-medium text-foreground">
                            {getTimeUntilExpiry(url.expiryDate)}
                          </p>
                          <p className="text-sm text-muted-foreground">Time Left</p>
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Created:
                          </span>
                          <span className="text-foreground">{formatDate(url.createdAt)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Expires:
                          </span>
                          <span className={cn(
                            "font-medium",
                            isExpired ? "text-destructive" : "text-foreground"
                          )}>
                            {formatDate(url.expiryDate)}
                          </span>
                        </div>
                      </div>

                      {/* Recent Clicks */}
                      {url.clicks.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-foreground">Recent Activity</p>
                          <div className="space-y-1">
                            {url.clicks.slice(-3).reverse().map((click, index) => (
                              <div key={index} className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">
                                  {formatDate(click.timestamp)}
                                </span>
                                <span className="text-foreground">
                                  {click.source}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}