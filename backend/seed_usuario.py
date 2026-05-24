from app.database import SessionLocal
from app.auth.security import hash_password
from app.models.usuario import Usuario
from app.models.enums import PerfilUsuario

db = SessionLocal()

for usuario in [
    Usuario(nome="Dra. Ana Lima",    email="medico@sus.gov.br",     senha_hash=hash_password("senha123"), perfil=PerfilUsuario.medico),
    Usuario(nome="Enf. Carlos Melo", email="enfermeiro@sus.gov.br", senha_hash=hash_password("senha123"), perfil=PerfilUsuario.enfermeiro),
    Usuario(nome="Recep. Julia",     email="recepcao@sus.gov.br",   senha_hash=hash_password("senha123"), perfil=PerfilUsuario.recepcionista),
]:
    db.add(usuario)

db.commit()
print("Usuários criados com sucesso.")
db.close()