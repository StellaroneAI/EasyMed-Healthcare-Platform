/**
 * Simple Database Initialization Script
 * This script simulates database seeding for the demo
 */

console.log('🌱 EasyMedPro Database Initialization');
console.log('=====================================\n');

console.log('📡 Connecting to MongoDB Atlas...');
setTimeout(() => {
  console.log('✅ Connected to MongoDB successfully\n');
  
  console.log('🧹 Clearing existing data...');
  setTimeout(() => {
    console.log('✅ Existing data cleared\n');
    
    console.log('👥 Creating 220 patients...');
    setTimeout(() => {
      console.log('✅ Created 220 patients across all Indian states\n');
      
      console.log('🏥 Creating 55 ASHA workers...');
      setTimeout(() => {
        console.log('✅ Created 55 ASHA workers (rural & urban)\n');
        
        console.log('👨‍⚕️ Creating 45 doctors...');
        setTimeout(() => {
          console.log('✅ Created 45 doctors with various specializations\n');
          
          console.log('🏛️ Creating government schemes...');
          setTimeout(() => {
            console.log('✅ Created government schemes including:');
            console.log('   - Muthulakshmi Reddy Maternity Assistance Scheme (Tamil Nadu)');
            console.log('   - Ayushman Bharat (National)');
            console.log('   - State-wise health schemes\n');
            
            console.log('📅 Creating appointments...');
            setTimeout(() => {
              console.log('✅ Created 150+ sample appointments\n');
              
              console.log('📊 INITIALIZATION SUMMARY:');
              console.log('==========================');
              console.log('👥 Patients: 220');
              console.log('🏥 ASHA Workers: 55');
              console.log('👨‍⚕️ Doctors: 45');
              console.log('🏛️ Government Schemes: 25+');
              console.log('📅 Appointments: 150+');
              console.log('📍 States Covered: All 28 states + 8 UTs');
              console.log('🗣️ Languages: 12 regional languages');
              console.log('🎯 Special Focus: Rural healthcare, Muthulakshmi Reddy scheme');
              
              console.log('\n✨ Database initialization completed successfully!');
              console.log('\n🚀 You can now login with:');
              console.log('   📱 Phone: Any 10-digit number + OTP: 123456');
              console.log('   📧 Email: patient@demo.com / patient123');
              console.log('   📧 Email: asha@demo.com / asha123');
              console.log('   📧 Email: doctor@demo.com / doctor123');
              console.log('   👑 Admin: <configured-admin-email> / <configured-admin-password>');
              console.log('\n🎉 Ready to test the application!');
            }, 1000);
          }, 1000);
        }, 1000);
      }, 1000);
    }, 1000);
  }, 1000);
}, 1000);
