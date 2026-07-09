export async function GET() {
  // بيانات مؤقتة من قاعدة البيانات
  const ads = [
    { id: 1, title: 'BMW 2020', description: 'حالة ممتازة', price: '150,000 ر.س' },
    { id: 2, title: 'Toyota Corolla', description: 'موثوقة وآمنة', price: '80,000 ر.س' },
    { id: 3, title: 'Mercedes C300', description: 'فاخرة وأنيقة', price: '200,000 ر.س' },
  ]
  
  return Response.json(ads)
}
