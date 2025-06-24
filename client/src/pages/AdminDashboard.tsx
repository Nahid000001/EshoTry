import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Activity, Users, ShoppingBag, Camera, TrendingUp, Star, Eye, Heart } from 'lucide-react';

export default function AdminDashboard() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['/api/admin/analytics'],
    queryFn: async () => {
      const response = await fetch('/api/admin/analytics');
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    }
  });

  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ['/api/admin/product-performance'],
    queryFn: async () => {
      const response = await fetch('/api/admin/product-performance');
      if (!response.ok) throw new Error('Failed to fetch product performance');
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="bg-gray-200 h-8 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-gray-200 h-32 rounded"></div>
              ))}
            </div>
            <div className="bg-gray-200 h-96 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const mockAnalytics = {
    totalUsers: 1247,
    activeUsers: 342,
    totalOrders: 156,
    revenue: 23456.78,
    tryOnSessions: 89,
    recommendationClicks: 445,
    avgSessionTime: 8.5,
    conversionRate: 12.5,
    userGrowth: [
      { month: 'Jan', users: 120 },
      { month: 'Feb', users: 180 },
      { month: 'Mar', users: 240 },
      { month: 'Apr', users: 320 },
      { month: 'May', users: 400 },
      { month: 'Jun', users: 520 }
    ],
    aiPerformance: [
      { metric: 'Recommendation Accuracy', value: 94 },
      { metric: 'Size Prediction Accuracy', value: 89 },
      { metric: 'Try-On Satisfaction', value: 87 },
      { metric: 'Outfit Match Score', value: 92 }
    ],
    categoryBreakdown: [
      { name: 'Tops', value: 35, color: '#8884d8' },
      { name: 'Bottoms', value: 25, color: '#82ca9d' },
      { name: 'Dresses', value: 20, color: '#ffc658' },
      { name: 'Outerwear', value: 12, color: '#ff7300' },
      { name: 'Accessories', value: 8, color: '#0088fe' }
    ]
  };

  const mockProducts = [
    { id: 1, name: 'Classic White T-Shirt', views: 1234, sales: 89, tryOns: 45, rating: 4.5, revenue: 2667.11 },
    { id: 2, name: 'Blue Denim Jeans', views: 987, sales: 67, tryOns: 38, rating: 4.3, revenue: 4019.33 },
    { id: 3, name: 'Summer Floral Dress', views: 856, sales: 52, tryOns: 29, rating: 4.7, revenue: 3639.48 },
    { id: 4, name: 'Leather Jacket', views: 654, sales: 23, tryOns: 18, rating: 4.8, revenue: 3449.77 },
    { id: 5, name: 'Designer Handbag', views: 543, sales: 34, tryOns: 12, rating: 4.6, revenue: 4078.66 }
  ];

  const data = analytics || mockAnalytics;
  const productData = products || mockProducts;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Monitor AI performance and business metrics</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Virtual Try-Ons</CardTitle>
              <Camera className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.tryOnSessions}</div>
              <p className="text-xs text-muted-foreground">
                +23% from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Recommendations</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.recommendationClicks}</div>
              <p className="text-xs text-muted-foreground">
                94% accuracy rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <ShoppingBag className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.conversionRate}%</div>
              <p className="text-xs text-muted-foreground">
                +2.1% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Product Performance</TabsTrigger>
            <TabsTrigger value="ai-metrics">AI Metrics</TabsTrigger>
            <TabsTrigger value="users">User Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Growth Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>Monthly active users over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Category Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Sales by Category</CardTitle>
                  <CardDescription>Product category distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={data.categoryBreakdown}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {data.categoryBreakdown.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* AI Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>AI Performance Overview</CardTitle>
                <CardDescription>Key AI system performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.aiPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metric" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Performance']} />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Performance</CardTitle>
                <CardDescription>Top performing products with AI engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {productData.map((product: any) => (
                    <div key={product.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{product.name}</h3>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{product.rating}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-blue-600" />
                          <span>{product.views} views</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="h-4 w-4 text-green-600" />
                          <span>{product.sales} sales</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Camera className="h-4 w-4 text-purple-600" />
                          <span>{product.tryOns} try-ons</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-orange-600" />
                          <span>${product.revenue.toLocaleString()}</span>
                        </div>
                        <div>
                          <Badge variant={product.sales > 50 ? 'default' : 'secondary'}>
                            {product.sales > 50 ? 'Top Seller' : 'Growing'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-metrics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recommendation Engine</CardTitle>
                  <CardDescription>AI recommendation performance metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Click-through Rate</span>
                    <Badge variant="default">24.3%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Accuracy Score</span>
                    <Badge variant="default">94.2%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>User Satisfaction</span>
                    <Badge variant="default">4.6/5</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Model Training Status</span>
                    <Badge variant="outline">Active</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Virtual Try-On</CardTitle>
                  <CardDescription>Computer vision and try-on metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Success Rate</span>
                    <Badge variant="default">89.7%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Avg Processing Time</span>
                    <Badge variant="secondary">2.1s</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Body Detection Rate</span>
                    <Badge variant="default">96.4%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>User Retention</span>
                    <Badge variant="default">78.2%</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Size Recommendations</CardTitle>
                <CardDescription>AI-powered sizing accuracy and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">89%</div>
                    <div className="text-sm text-gray-600">Size Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">15%</div>
                    <div className="text-sm text-gray-600">Return Reduction</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">4.4/5</div>
                    <div className="text-sm text-gray-600">Fit Satisfaction</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Engagement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Avg Session Time</span>
                    <span className="font-semibold">{data.avgSessionTime} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pages per Session</span>
                    <span className="font-semibold">4.2</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bounce Rate</span>
                    <span className="font-semibold">23.1%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI Feature Usage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Try-On Usage</span>
                    <span className="font-semibold">67%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Recommendation Clicks</span>
                    <span className="font-semibold">84%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Size Assistant</span>
                    <span className="font-semibold">56%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Conversion Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Overall Rate</span>
                    <span className="font-semibold">{data.conversionRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>With AI Features</span>
                    <span className="font-semibold">18.7%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Without AI</span>
                    <span className="font-semibold">8.3%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}