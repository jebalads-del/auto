{
    const fetchData = async () => {
      try {
        const carsRes = await fetch('/api/cars', { cache: 'no-store' });
        if (carsRes.ok) {
          const carsData = await carsRes.json();
          if (carsData && carsData.success && Array.isArray(carsData.cars)) {
            setCars(carsData.cars);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const validCars = Array.isArray(cars) ? cars : [];
  const filteredCars = validCars.filter(car => {
    if (!car) return false;
    const carModel = car.model || car.MODEL || '';
    if (!selectedModel) return true;
    return carModel.toLowerCase() === selectedModel.toLowerCase();
  });

  const uniqueModels = validCars.reduce((acc: { brand: string; model: string }[], current) => {
    if (!current) return acc;
    const carModel = current.model || current.MODEL || '';
    const carBrand = current.brand || current.BRAND || '';
    if (!carModel) return acc;
    const x = acc.find(item => item.model.toLowerCase() === carModel.toLowerCase());
    if (!x) acc.push({ brand: carBrand, model: carModel });
    return acc;
  }, []);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={{ fontFamily: 'sans-serif', color: '#64748b', marginTop: '15px' }}>جاري تحميل صالة العرض...</p>
      </div>
    );
  }
  return (
    <div style={styles.container}>
      <div style={styles.heroSection}>
        <header style={styles.header}>
          <div style={styles.headerContent}>
            <h1 style={
