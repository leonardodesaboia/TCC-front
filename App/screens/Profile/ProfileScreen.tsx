import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../components/button/Button';
import { BrandMark } from '../../components/layout/BrandMark';
import { SectionHeader } from '../../components/layout/SectionHeader';
import {
  getApiUrl,
  getRoleDescription,
  getRoleLabel,
  login,
  logout,
  resetUserPassword,
  sendResetCode,
  type LoginSession,
} from '../../services/auth';

type FeedbackTone = 'error' | 'success';

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Nao foi possivel concluir a autenticacao.';
}

function getFeedbackBoxClassName(tone: FeedbackTone) {
  if (tone === 'success') {
    return 'rounded-3xl border border-green-200 bg-green-50 px-4 py-3';
  }

  return 'rounded-3xl border border-red-200 bg-red-50 px-4 py-3';
}

function getFeedbackTextClassName(tone: FeedbackTone) {
  if (tone === 'success') {
    return 'text-body-sm font-bold text-green-700';
  }

  return 'text-body-sm font-bold text-red-700';
}

export function ProfileScreen() {
  const [session, setSession] = useState<LoginSession | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<FeedbackTone>('error');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [showPasswordHelp, setShowPasswordHelp] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetFeedback, setResetFeedback] = useState<string | null>(null);
  const [resetFeedbackTone, setResetFeedbackTone] = useState<FeedbackTone>('error');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const minutesUntilExpiry = session ? Math.max(1, Math.round((session.expiresAt - Date.now()) / 60000)) : null;
  const roleLabel = session ? getRoleLabel(session.user.role) : null;

  async function handleLogin() {
    setFeedback(null);
    setFeedbackTone('error');
    setIsLoggingIn(true);

    try {
      const newSession = await login(email, password);

      setSession(newSession);
      setPassword('');
      setShowPasswordHelp(false);
      setResetFeedback(null);
    } catch (error) {
      setFeedbackTone('error');
      setFeedback(getErrorMessage(error));
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function handleLogout() {
    setFeedback(null);
    setFeedbackTone('error');
    setIsLoggingOut(true);

    try {
      if (session) {
        await logout(session.refreshToken);
      }

      setSession(null);
    } catch (error) {
      setFeedbackTone('error');
      setFeedback(getErrorMessage(error));
    } finally {
      setIsLoggingOut(false);
    }
  }

  function handleOpenPasswordHelp() {
    const willOpen = !showPasswordHelp;

    setShowPasswordHelp(willOpen);
    setFeedback(null);
    setResetFeedback(null);
    setResetFeedbackTone('error');

    if (willOpen && !resetEmail.trim()) {
      setResetEmail(email.trim());
    }

    if (!willOpen) {
      setResetCode('');
      setNewPassword('');
    }
  }

  async function handleSendCode() {
    setResetFeedback(null);
    setResetFeedbackTone('success');
    setIsSendingCode(true);

    try {
      await sendResetCode(resetEmail);
      setResetFeedback('Se o e-mail existir e estiver ativo, o codigo de 4 digitos sera enviado.');
    } catch (error) {
      setResetFeedbackTone('error');
      setResetFeedback(getErrorMessage(error));
    } finally {
      setIsSendingCode(false);
    }
  }

  async function handleResetPassword() {
    setResetFeedback(null);
    setResetFeedbackTone('error');
    setIsResettingPassword(true);

    try {
      await resetUserPassword(resetEmail, resetCode, newPassword);

      const cleanEmail = resetEmail.trim();

      setEmail(cleanEmail);
      setPassword('');
      setResetCode('');
      setNewPassword('');
      setShowPasswordHelp(false);
      setFeedbackTone('success');
      setFeedback('Senha atualizada com sucesso. Agora faca login com a nova senha.');
    } catch (error) {
      setResetFeedbackTone('error');
      setResetFeedback(getErrorMessage(error));
    } finally {
      setIsResettingPassword(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-4">
          <BrandMark compact />

          <View className="mt-8 gap-5">
            {session ? null : (
              <View className="overflow-hidden rounded-card bg-primary px-5 pb-6 pt-6">
                <View className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-primary-soft/35" />
                <View className="absolute -bottom-8 left-0 h-24 w-24 rounded-full bg-primary-deep/20" />

                <Text className="text-label-lg font-bold uppercase tracking-[1.2px] text-white/80">Conta All Set</Text>
                <Text className="mt-3 text-title-lg font-extrabold text-white">Entre para continuar seus pedidos, propostas e atendimentos.</Text>
                <Text className="mt-3 text-body-lg text-white/90">
                  O login fica nesta aba e usa seu cadastro real do backend com e-mail e senha.
                </Text>

                <View className="mt-5 flex-row flex-wrap gap-2">
                  <View className="rounded-full bg-white/15 px-3 py-2">
                    <Text className="text-label-lg font-bold text-white">Cliente</Text>
                  </View>
                  <View className="rounded-full bg-white/15 px-3 py-2">
                    <Text className="text-label-lg font-bold text-white">Profissional</Text>
                  </View>
                </View>
              </View>
            )}

            <SectionHeader
              eyebrow="Conta"
              description={
                session
                  ? 'Sessao aberta com JWT do backend. O aplicativo reconhece o papel do usuario e mostra um resumo simples da conta.'
                  : 'Use o formulario abaixo para entrar. O login aparece logo no inicio da tela.'
              }
              title={session ? 'Conta conectada ao backend' : 'Acessar minha conta'}
            />

            {session ? (
              <>
                <View className="overflow-hidden rounded-card bg-primary px-5 pb-6 pt-6">
                  <View className="absolute -right-6 -top-8 h-28 w-28 rounded-full bg-primary-soft/30" />
                  <View className="mb-4 h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
                    <Ionicons color="#FFFFFF" name="shield-checkmark-outline" size={28} />
                  </View>

                  <Text className="text-label-lg font-bold uppercase tracking-[1.2px] text-white/80">{roleLabel}</Text>
                  <Text className="mt-2 text-title-lg font-extrabold text-white">{session.user.name}</Text>
                  <Text className="mt-1 text-body-lg text-white/90">{session.user.email}</Text>
                  <Text className="mt-3 text-body-sm text-white/85">{getRoleDescription(session.user.role)}</Text>

                  <View className="mt-5 flex-row flex-wrap gap-2">
                    <View className="rounded-full bg-white/15 px-3 py-2">
                      <Text className="text-label-lg font-bold text-white">JWT ativo</Text>
                    </View>
                    <View className="rounded-full bg-white/15 px-3 py-2">
                      <Text className="text-label-lg font-bold text-white">Expira em ~{minutesUntilExpiry} min</Text>
                    </View>
                  </View>
                </View>

                <View className="rounded-card border border-gray-2 bg-white p-5">
                  <Text className="text-body-lg font-bold text-brown">Resumo da sessao</Text>

                  <View className="mt-4 gap-4">
                    <View>
                      <Text className="text-label-lg font-bold uppercase tracking-[1.2px] text-brown-light">Papel reconhecido</Text>
                      <Text className="mt-1 text-body-lg text-brown">{roleLabel}</Text>
                    </View>

                    <View>
                      <Text className="text-label-lg font-bold uppercase tracking-[1.2px] text-brown-light">Telefone</Text>
                      <Text className="mt-1 text-body-lg text-brown">{session.user.phone || 'Nao carregado nesta sessao'}</Text>
                    </View>

                    <View>
                      <Text className="text-label-lg font-bold uppercase tracking-[1.2px] text-brown-light">Base da API</Text>
                      <Text className="mt-1 text-body-lg text-brown">{getApiUrl()}</Text>
                    </View>
                  </View>
                </View>

                <View className="rounded-card border border-gray-2 bg-white p-5">
                  <Text className="text-body-lg font-bold text-brown">Acoes disponiveis</Text>
                  <Text className="mt-2 text-body-sm text-brown-light">
                    O proximo passo natural e proteger rotas especificas e ligar os fluxos por role sem alterar o contrato do backend.
                  </Text>

                  <View className="mt-5 gap-3">
                    <Button disabled={isLoggingOut} fullWidth label="Sair da conta" loading={isLoggingOut} onPress={handleLogout} />
                  </View>
                </View>
              </>
            ) : (
              <>
                <View className="rounded-card border border-gray-2 bg-white p-5">
                  <Text className="text-body-lg font-bold text-brown">
                    {showPasswordHelp ? 'Recuperar acesso' : 'Entrar com e-mail e senha'}
                  </Text>
                  <Text className="mt-2 text-body-sm text-brown-light">
                    {showPasswordHelp
                      ? 'Use este mesmo espaco do login para enviar o codigo, informar os 4 digitos e escolher a nova senha.'
                      : 'Digite os dados da sua conta. O acesso funciona para contratante e profissional.'}
                  </Text>

                  <View className="mt-5 gap-4">
                    {showPasswordHelp ? (
                      <>
                        <View>
                          <Text className="mb-2 text-label-lg font-bold uppercase tracking-[1.2px] text-brown-light">E-mail da conta</Text>
                          <View className="flex-row items-center gap-3 rounded-3xl border border-gray-2 bg-white px-4 py-1">
                            <Ionicons color="#AF5D1F" name="mail-open-outline" size={20} />
                            <TextInput
                              autoCapitalize="none"
                              autoCorrect={false}
                              className="flex-1 py-4 text-body-lg text-brown"
                              keyboardType="email-address"
                              onChangeText={setResetEmail}
                              placeholder="voce@allset.com"
                              placeholderTextColor="#A69A84"
                              textContentType="emailAddress"
                              value={resetEmail}
                            />
                          </View>
                        </View>

                        <Button
                          disabled={isSendingCode || isResettingPassword}
                          fullWidth
                          label="Enviar codigo por e-mail"
                          loading={isSendingCode}
                          onPress={handleSendCode}
                        />

                        <View>
                          <Text className="mb-2 text-label-lg font-bold uppercase tracking-[1.2px] text-brown-light">Codigo recebido</Text>
                          <View className="flex-row items-center gap-3 rounded-3xl border border-gray-2 bg-white px-4 py-1">
                            <Ionicons color="#AF5D1F" name="key-outline" size={20} />
                            <TextInput
                              className="flex-1 py-4 text-body-lg text-brown"
                              keyboardType="number-pad"
                              maxLength={4}
                              onChangeText={setResetCode}
                              placeholder="0000"
                              placeholderTextColor="#A69A84"
                              value={resetCode}
                            />
                          </View>
                        </View>

                        <View>
                          <Text className="mb-2 text-label-lg font-bold uppercase tracking-[1.2px] text-brown-light">Nova senha</Text>
                          <View className="flex-row items-center gap-3 rounded-3xl border border-gray-2 bg-white px-4 py-1">
                            <Ionicons color="#AF5D1F" name="shield-outline" size={20} />
                            <TextInput
                              className="flex-1 py-4 text-body-lg text-brown"
                              onChangeText={setNewPassword}
                              placeholder="Nova senha forte"
                              placeholderTextColor="#A69A84"
                              secureTextEntry
                              textContentType="newPassword"
                              value={newPassword}
                            />
                          </View>
                        </View>

                        <View className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3">
                          <Text className="text-body-sm font-bold text-red-700">
                            Crie uma nova senha com pelo menos 8 caracteres, incluindo letra maiuscula, letra minuscula, numero e caractere especial.
                          </Text>
                        </View>
                      </>
                    ) : (
                      <>
                        <View>
                          <Text className="mb-2 text-label-lg font-bold uppercase tracking-[1.2px] text-brown-light">E-mail</Text>
                          <View className="flex-row items-center gap-3 rounded-3xl border border-gray-2 bg-white px-4 py-1">
                            <Ionicons color="#AF5D1F" name="mail-outline" size={20} />
                            <TextInput
                              autoCapitalize="none"
                              autoCorrect={false}
                              className="flex-1 py-4 text-body-lg text-brown"
                              keyboardType="email-address"
                              onChangeText={setEmail}
                              placeholder="voce@allset.com"
                              placeholderTextColor="#A69A84"
                              textContentType="emailAddress"
                              value={email}
                            />
                          </View>
                        </View>

                        <View>
                          <Text className="mb-2 text-label-lg font-bold uppercase tracking-[1.2px] text-brown-light">Senha</Text>
                          <View className="flex-row items-center gap-3 rounded-3xl border border-gray-2 bg-white px-4 py-1">
                            <Ionicons color="#AF5D1F" name="lock-closed-outline" size={20} />
                            <TextInput
                              className="flex-1 py-4 text-body-lg text-brown"
                              onChangeText={setPassword}
                              placeholder="Sua senha"
                              placeholderTextColor="#A69A84"
                              secureTextEntry
                              textContentType="password"
                              value={password}
                            />
                          </View>
                        </View>
                      </>
                    )}

                    {feedback ? (
                      <View className={getFeedbackBoxClassName(feedbackTone)}>
                        <Text className={getFeedbackTextClassName(feedbackTone)}>{feedback}</Text>
                      </View>
                    ) : null}

                    {resetFeedback ? (
                      <View className={getFeedbackBoxClassName(resetFeedbackTone)}>
                        <Text className={getFeedbackTextClassName(resetFeedbackTone)}>{resetFeedback}</Text>
                      </View>
                    ) : null}

                    <View className="gap-3">
                      {showPasswordHelp ? (
                        <>
                          <Button
                            disabled={isSendingCode || isResettingPassword}
                            fullWidth
                            label="Redefinir senha"
                            loading={isResettingPassword}
                            onPress={handleResetPassword}
                          />
                          <Button
                            disabled={isSendingCode || isResettingPassword}
                            fullWidth
                            label="Voltar para login"
                            onPress={handleOpenPasswordHelp}
                            variant="outline"
                          />
                        </>
                      ) : (
                        <>
                          <Button disabled={isLoggingIn || isLoggingOut} fullWidth label="Entrar agora" loading={isLoggingIn} onPress={handleLogin} />
                          <Button
                            disabled={isLoggingIn || isLoggingOut || isSendingCode || isResettingPassword}
                            fullWidth
                            label="Esqueci minha senha"
                            onPress={handleOpenPasswordHelp}
                            variant="outline"
                          />
                        </>
                      )}
                    </View>

                    <View className="rounded-3xl bg-surface-alt px-4 py-3">
                      <Text className="text-body-sm text-brown-light">
                        {showPasswordHelp
                          ? 'Se a senha for redefinida com sucesso, voce volta para este mesmo espaco e faz login com a nova senha.'
                          : 'Depois do login, o app usa o token para identificar se a conta e cliente ou profissional.'}
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="rounded-card border border-gray-2 bg-white p-5">
                  <Text className="text-body-lg font-bold text-brown">Quem pode entrar</Text>
                  <View className="mt-4 gap-3">
                    <View className="rounded-3xl bg-surface-alt p-4">
                      <Text className="text-body-lg font-bold text-brown">Contratante</Text>
                      <Text className="mt-2 text-body-sm text-brown-light">
                        Usuario que busca profissionais, compara opcoes e acompanha pedidos.
                      </Text>
                    </View>

                    <View className="rounded-3xl bg-surface-alt p-4">
                      <Text className="text-body-lg font-bold text-brown">Profissional</Text>
                      <Text className="mt-2 text-body-sm text-brown-light">
                        Usuario que presta servicos e tera regras adicionais de verificacao, agenda e recebimento.
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="rounded-card border border-dashed border-gray-2 bg-surface-alt p-5">
                  <Text className="text-body-lg font-bold text-brown">Ambiente de integracao</Text>
                  <Text className="mt-2 text-body-sm text-brown-light">API alvo: {getApiUrl()}</Text>
                  <Text className="mt-2 text-body-sm text-brown-light">
                    No celular, o app e o computador precisam estar na mesma rede Wi-Fi. Se o IP da maquina mudar, atualize o arquivo .env e reinicie o Expo. No navegador em {`http://localhost:3002`}, o backend ainda precisa de CORS.
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
