import bcrypt from 'bcryptjs';

const password = 'password123';
const saltRounds = 10;

bcrypt.hash(password, saltRounds).then(hash => {
  console.log('Password: password123');
  console.log('Hash:', hash);
  console.log('\nCopy this hash to your users.ts file');
});
