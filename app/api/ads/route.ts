export async function GET() {
  const ads = [
    { id: 1, title: 'BMW 2020', description: 'سيارة بحالة ممتازة - محرك قوي وفاخرة', price: '150,000 ر.س' },
    { id: 2, title: 'Toyota Corolla', description: 'سيارة موثوقة وآمنة - اقتصادية في الوقود', price: '80,000 ر.س' },
    { id: 3, title: 'Mercedes C300', description: 'سيارة فاخرة وأنيقة - تقنيات حديثة', price: '200,000 ر.س' },
    { id: 4, title: 'Audi A4', description: 'سيارة رياضية وعملية - أداء ممتاز', price: '120,000 ر.س' },
    { id: 5, title: 'Hyundai Elantra', description: 'سيارة عملية واقتصادية - معدات حديثة', price: '60,000 ر.س' },
  ]
  
  return Response.json(ads)
}