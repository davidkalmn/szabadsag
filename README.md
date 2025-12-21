# Szakdolgozat: Szabadságkezelő Rendszer

Több role-os (user / manager / admin) webalapú szabadságkezelő rendszer.  
Technológiák: **Laravel 11**, **Inertia.js (React)**, **Tailwind CSS**, **MySQL**.

---

## Funkciók

- Bejelentkezés (Breeze, session alapú auth)  
- Szerepkörök: **user**, **manager**, **admin**  
- Szabadságigénylés beküldése (user/manager/admin)  
- Kérelmek elbírálása (manager: beosztottak; admin: mindenki)  
- Naptár nézetek (saját/csapat/összes)  
- Felhasználókezelés (admin)  
- Értesítések (database)  
- Műveleti napló (activity log)  
- **Publikus regisztráció letiltva** (user-t admin hoz létre)

---

## Követelmények

### Helyi telepítéshez:
- PHP **8.2+**
- Composer **2.x**
- Node.js **LTS (20.x)** + npm
- MySQL **8.x** (vagy kompatibilis)
- (Windows esetén ajánlott: **Laragon Full**)

### Docker használatához:
- **Docker** és **Docker Compose**
- (Nincs szükség PHP, Composer, Node.js telepítésre)

---

## Docker használata

A projekt Docker konténerekkel is futtatható, így nincs szükség helyi PHP, Composer vagy Node.js telepítésre.

### Előfeltételek
- Telepített [Docker](https://www.docker.com/get-started) és Docker Compose

### Futtatás

1. **Konténerek indítása:**
   ```bash
   docker-compose up -d
   ```

2. **Alkalmazás elérése:**
   - Backend: http://localhost:8000
   - Frontend dev server (Vite): http://localhost:5173

3. **Konténerek leállítása:**
   ```bash
   docker-compose down
   ```

### További parancsok

**Composer parancsok futtatása:**
```bash
docker-compose exec app composer install
docker-compose exec app composer update
```

**Artisan parancsok futtatása:**
```bash
docker-compose exec app php artisan migrate
docker-compose exec app php artisan db:seed
docker-compose exec app php artisan tinker
```

**NPM parancsok futtatása:**
```bash
docker-compose exec node npm install
docker-compose exec node npm run build
```

**Logok megtekintése:**
```bash
docker-compose logs -f app
docker-compose logs -f node
```

**Konténerek újraépítése (ha változtatások történtek a Dockerfile-ban):**
```bash
docker-compose build
docker-compose up -d
```

---
