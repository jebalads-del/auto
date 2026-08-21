import { neon } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_A_SE_URL;

if (!connectionString) {
  console.error("Error: Database connection string not found!");
  process.exit(1);
}

const sql = neon(connectionString!);

async function checkSchema() {
  try {
    // Check the cars table structure
    const tableInfo = await sql`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM 
        information_schema.columns
      WHERE 
        table_name = 'cars'
      ORDER BY 
        ordinal_position;
    `;

    console.log('\n======= CARS TABLE SCHEMA =======\n');
    console.table(tableInfo);

    // Check specifically the images column
    const imagesColumn = await sql`
      SELECT 
        column_name,
        data_type,
        udt_name,
        is_nullable
      FROM 
        information_schema.columns
      WHERE 
        table_name = 'cars' 
        AND column_name = 'images';
    `;

    console.log('\n======= IMAGES COLUMN DETAILS =======\n');
    console.table(imagesColumn);

    // Check sample data
    const sampleData = await sql`
      SELECT 
        id,
        brand,
        model,
        images,
        typeof(images) as images_type
      FROM 
        cars
      LIMIT 5;
    `;

    console.log('\n======= SAMPLE CAR DATA (First 5) =======\n');
    console.table(sampleData);

    // Check total cars count
    const countResult = await sql`
      SELECT COUNT(*) as total_cars FROM cars;
    `;

    console.log('\n======= TOTAL CARS =======\n');
    console.log(countResult);

  } catch (error: any) {
    console.error('Database Error:', error.message);
  }
}

checkSchema();
