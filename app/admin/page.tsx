xl">⭐</div>
            <div className="font-bold">إعلانات مميزة</div>
            <div className="text-sm">(مدفوعة)</div>
          </button>
        </div>

        {/* عرض المحتوى حسب التاب المختار */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>
          )}

          {/* تبويب السيارات */}
          {activeTab === 'cars' && (
            <div>
              <h2 className="text-xl font-bold mb-4">🚗 إدارة السيارات</h2>
              <div className="flex gap-2 mb-4">
                <button className="bg-yellow-500 text-white px-4 py-2 rounded">قيد المراجعة</button>
                <button className="bg-green-500 text-white px-4 py-2 rounded">تم الموافقة</button>
                <button className="bg-red-500 text-white px-4 py-2 rounded">مباع</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 border">#</th>
                      <th className="p-2 border">السيارة</th>
                      <th className="p-2 border">السعر</th>
                      <th className="p-2 border">الحالة</th>
                      <th className="p-2 border">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.cars || []).map((car: any, i: number) => (
                      <tr key={car.id} className="hover:bg-gray-50">
                        <td className="p-2 border">{i + 1}</td>
                        <td className="p-2 border">{car.title || car.brand}</td>
                        <td className="p-2 border">{car.price} $</td>
                        <td className="p-2 border">
                          <span className={`px-2 py-1 rounded text-sm ${
                            car.status === 'approved' ? 'bg-green-100 text-green-700' :
                            car.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {car.status === 'approved' ? '✅ موافق' :
                             car.status === 'pending' ? '⏳ قيد المراجعة' :
                             '❌ مرفوض'}
                          </span>
                        </td>
                        <td className="p-2 border">
                          <div className="flex gap-2">
                            {car.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => updateCarStatus(car.id, 'approved')}
                                  className="bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600"
                                >
                                  موافقة
                                </button>
                                <button
                                  onClick={() => updateCarStatus(car.id, 'rejected')}
                                  className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                                >
                                  رفض
                                </button>
                              </>
                            )}
                            {car.status === 'approved' && (
                              <button
                                onClick={() => updateCarStatus(car.id, 'sold')}
                                className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
                              >
                                ✅ مباع
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {(data.cars || []).length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center p-4 text-gray-500">
                          لا توجد سيارات
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* تبويب المستخدمين */}
          {activeTab === 'users' && (
            <div>
              <h2 className="text-xl font-bold mb-4">👥 إدارة المستخدمين</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <
