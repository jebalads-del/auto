             )}

              {/* تبويب المستخدمين */}
              {activeTab === 'users' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">👥 إدارة المستخدمين</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-gradient-to-r from-gray-100 to-gray-200">
                          <th className="p-3 border text-right">#</th>
                          <th className="p-3 border text-right">الاسم</th>
                          <th className="p-3 border text-right">البريد الإلكتروني</th>
                          <th className="p-3 border text-right">الحالة</th>
                          <th className="p-3 border text-right">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center p-8 text-gray-400">
                              📭 لا يوجد مستخدمين
                            </td>
                          </tr>
                        ) : (
                          users.map((user: any, i: number) => {
                            const isAdminUser = user.email?.toLowerCase().includes('admin') || user.name?.toLowerCase().includes('admin');
                            return (
                              <tr key={user.id} className="hover:bg-blue-50 transition border-b">
                                <td className="p-3 border text-center">{i + 1}</td>
                                <td className="p-3 border">
                                  <div className="flex items-center gap-2">
                                    <span>{user.name || '—'}</span>
                                    {isAdminUser && (
                                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">مسؤول</span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-3 border">{user.email || '—'}</td>
                                <td className="p-3 border">
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                  }`}>
                                    {user.is_active ? '🟢 نشط' : '🔴 غير نشط'}
                                  </span>
                                </td>
                                <td className="p-3 border">
                                  <div className="flex flex-wrap gap-2">
                                    <button
                                      onClick={() => toggleUserStatus(user.id, user.is_active)}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-medium hover:shadow-lg transition-all ${
                                        user.is_active 
                                          ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white' 
                                          : 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                                      }`}
                                    >
                                      {user.is_active ? '🔴 تعطيل' : '🟢 تفعيل'}
                                    </button>
                                    {!isAdminUser && (
                                      <button
                                        onClick={() => deleteUser(user.id)}
                                        className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:shadow-lg transition-all"
                                      >
                                        🗑️ حذف
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* تبويب خيارات الدفع */}
              {activeTab === 'payments' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">💳 خيارات الدفع</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border-2 border-blue-100 rounded-xl p-6 bg-blue-50/50">
                      <h3 className="font-bold text-lg text-blue-700 flex items-center gap-2">
                        <span>💳</span> باي بال
                      </h3>
                      <p className="text-sm text-gray-500 mb-3">إعدادات بوابة الدفع</p>
                      <input
                        type="text"
                        placeholder="البريد الإلكتروني لباي بال"
                        className="w-full border border-blue-200 rounded-lg p-3 mt-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                        defaultValue="example@paypal.com"
                      />
                      <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2.5 rounded-lg mt-3 hover:shadow-lg transition-all text-sm w-full font-medium">
                        💾 حفظ
                      </button>
                    </div>
                    <div className="border-2 border-purple-100 rounded-xl p-6 bg-purple-50/50">
                      <h3 className="font-bold text-lg text-purple-700 flex items-center gap-2">
                        <span>🏦</span> ويسترن يونيون
                      </h3>
                      <p className="text-sm text-gray-500 mb-3">معلومات التحويل</p>
                      <textarea
                        placeholder="معلومات ويسترن يونيون"
                        className="w-full border border-purple-200 rounded-lg p-3 mt-2 text-sm focus:ring-2 focus:ring-purple-400 outline-none"
                        rows={3}
                        defaultValue="الاسم: ...\nرقم الحساب: ..."
                      />
                      <button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-2.5 rounded-lg mt-3 hover:shadow-lg transition-all text-sm w-full font-medium">
                        💾 حفظ
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* تبويب الإعدادات */}
              {activeTab === 'settings' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">⚙️ إعدادات الموقع</h2>
                  <div className="max-w-lg bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="mb-4">
                      <label className="block font-bold text-gray-700 text-sm mb-2">📝 اسم الموقع</label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                        defaultValue="🚗 منصة إعلانات السيارات"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block font-bold text-gray-700 text-sm mb-2">🔧 حالة الصيانة</label>
                      <select className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-400 outline-none">
                        <option value="off">🟢 الموقع يعمل</option>
                        <option value="on">🔴 تحت الصيانة</option>
                      </select>
                    </div>
                    <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2.5 rounded-lg hover:shadow-lg transition-all text-sm w-full font-medium">
                      💾 حفظ الإعدادات
                    </button>
                  </div>
                </div>
              )}

              {/* تبويب الإعلانات المميزة */}
              {activeTab === 'premium' && (
         
