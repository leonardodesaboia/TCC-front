export function registrationFeedback(documentsUploaded: boolean, verificationStatus?: string) {
  if (!documentsUploaded) return { kind: 'info' as const, title: 'Conta criada, mas faltam os documentos', message: 'Não foi possível enviar todas as fotos. Confira e complete o envio em Perfil > Documentos.' };
  if (verificationStatus === 'approved') return { kind: 'success' as const, title: 'Conta profissional ativa!', message: 'Cadastre seus serviços em Perfil > Meus serviços e confira sua disponibilidade.' };
  if (verificationStatus === 'pending') return { kind: 'success' as const, title: 'Conta profissional criada!', message: 'Seus documentos estão em análise. Acompanhe em Perfil > Documentos.' };
  if (verificationStatus === 'rejected') return { kind: 'info' as const, title: 'Confira seus documentos', message: 'Consulte o motivo e as orientações em Perfil > Documentos.' };
  return { kind: 'success' as const, title: 'Conta profissional criada!', message: 'Documentos enviados. Confira a situação da conta em Perfil > Documentos.' };
}
