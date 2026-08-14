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
                      
