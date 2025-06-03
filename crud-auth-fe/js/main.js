document.addEventListener('DOMContentLoaded', () => {
    fetch('http://localhost:8000/api/users')
      .then(res => res.json())
      .then(users => {
        const userTable = document.getElementById('userTable');
        userTable.innerHTML = ''; // Bersihkan sebelum render
        users.forEach(user => {
          userTable.innerHTML += `
            <tr class="hover:bg-gray-50">
              <td class="py-2 px-4 border-b">${user.name}</td>
              <td class="py-2 px-4 border-b">${user.email}</td>
              <td class="py-2 px-4 border-b">
                <button class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">Hapus</button>
              </td>
            </tr>
          `;
        });
      })
      .catch(err => console.error('Gagal mengambil data pengguna:', err));
  });