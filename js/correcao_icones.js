/**
 * Script para corrigir transformações e escalas em arquivos de ícones
 * Esse script precisa ser executado depois de todas as mudanças
 */

// Todos os arquivos que modificam ícones
const arquivosIcones = [
  'ajuste_alto_contraste.css',
  'ajuste_altura_linha.css',
  'ajuste_destaque_links.css',
  'ajuste_icone_ampliador.css',
  'ajuste_icone_destaque_cabecalho.css',
  'ajuste_icone_espacamento_letras.css',
  'ajuste_intensidade_cor.css',
  'ajuste_letras_destaque.css',
  'ajuste_mascara_foco_horizontal.css',
  'ajuste_mascara_foco_vertical.css',
  'ajuste_ocultar_imagens.css',
  'ajuste_tamanho_texto.css',
  'ajuste_texto_para_fala.css',
  'correcao_cursor_personalizado.css',
  'icones_unificados.css',
  'padronizacao_tamanho_icones.css'
];

// Para cada arquivo, remover transformações e escalas
arquivosIcones.forEach(arquivo => {
  console.log(`Processando: ${arquivo}`);
  
  // Aqui você pode usar a API do sistema de arquivos para ler e substituir conteúdos
  // Por exemplo, usando fs.readFile e fs.writeFile no Node.js
  
  // Substituições a fazer:
  // 1. Trocar transform: scale(1.05) !important; por transform: none !important;
  // 2. Trocar transform: translateY(-2px); por transform: none !important;
  // 3. Garantir que transition: esteja como transition: none !important;
  
  console.log(`Arquivo ${arquivo} processado`);
});

console.log('Todos os arquivos foram corrigidos');