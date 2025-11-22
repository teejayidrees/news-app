export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl animate-pulse">
      <div className="h-4 w-24 bg-muted rounded mb-6"></div>

      <div className="flex gap-2 mb-4">
        <div className="h-6 w-20 bg-muted rounded-full"></div>
        <div className="h-6 w-32 bg-muted rounded"></div>
      </div>

      <div className="h-10 w-3/4 bg-muted rounded mb-6"></div>
      <div className="h-10 w-1/2 bg-muted rounded mb-8"></div>

      <div className="w-full aspect-video bg-muted rounded-xl mb-8"></div>

      <div className="space-y-4">
        <div className="h-4 w-full bg-muted rounded"></div>
        <div className="h-4 w-full bg-muted rounded"></div>
        <div className="h-4 w-5/6 bg-muted rounded"></div>
      </div>
    </div>
  )
}
