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

- PHP **8.2+**
- Composer **2.x**
- Node.js **LTS (20.x)** + npm
- MySQL **8.x** (vagy kompatibilis)
- (Windows esetén ajánlott: **Laragon Full**)
