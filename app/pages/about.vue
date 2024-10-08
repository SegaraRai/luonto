<template>
  <div class="flex flex-col gap-4 items-start py-2">
    <h2 id="about" class="text-2xl">Luonto について</h2>
    <div class="flex flex-col gap-4 items-start py-2">
      <p>
        Luonto は Nature Remo の非公式 Web アプリです。Nature Remo API
        を使用しています。
        <br />
        ユーザーインターフェイスは Nature 公式モバイルアプリを元にしています。
      </p>
      <p>
        私たちはセキュリティを重視しており、Nature API
        サーバー以外の外部サーバー（本サービスのサーバーを含む）にアクセストークンが送信されないように設計しています。
        <br />
        セキュリティ上の問題を発見した場合は、お手数ですが下記フォームまでご連絡ください。
        <br />
        <ULink
          class="text-sky-500 dark:text-sky-400 rounded"
          :class="STYLE_FOCUS_VISIBLE_RING"
          to="https://forms.gle/f87TXVBXUyf3Sx347"
          target="_blank"
        >
          Luonto 脆弱性報告フォーム
        </ULink>
      </p>
      <p>
        セキュリティ以外に関する要望や Pull Request は
        <ULink
          class="text-sky-500 dark:text-sky-400 rounded"
          :class="STYLE_FOCUS_VISIBLE_RING"
          to="https://github.com/SegaraRai/luonto"
          target="_blank"
        >
          GitHub リポジトリ
        </ULink>
        までお願いします。
      </p>
    </div>
    <h2 id="privacy" class="text-2xl">プライバシーポリシー</h2>
    <div class="flex flex-col gap-4 items-start py-2">
      <p>最終更新: 2023年11月12日</p>
      <h3 class="text-xl">はじめに</h3>
      <p>
        Luonto へようこそ！<br />
        私たちはユーザーのプライバシーを真剣に受け止めています。
        このプライバシーポリシーでは、収集する情報の種類、その使用方法、および情報の安全性を確保するための措置について説明します。
      </p>
      <h3 class="text-xl">収集する情報</h3>

      <ol class="list-decimal pl-5">
        <li>
          <strong>アクセストークン:</strong>
          <p>
            ユーザーは、Luonto が Nature Remo の API
            リクエストを行うためにアクセストークンを提供することができます。
            これらのトークンは Nature の API
            サーバーに直接送信され、他のサーバーが保存またはアクセスすることはありません。
            ユーザー体験向上のため、アクセストークンはユーザーのブラウザのストレージ
            (IndexedDB や LocalStorage など) に保存される場合があります。
          </p>
        </li>
        <li>
          <strong>Nature API レスポンス:</strong>
          <p>
            Luonto は Nature の API サーバーからのレスポンスを受信します。
            これらのレスポンスには、ユーザーのデバイスや家電に関する情報が含まれる場合があります。
            これらの情報は、ユーザー体験向上のためユーザーのブラウザのストレージに保存される場合があります。
          </p>
        </li>
        <li>
          <strong>アクセスデータ:</strong>
          <p>
            Luonto は Cloudflare Web Analytics
            を使用して、ユーザーアクセスに関するデータを収集することがあります。
            これには、匿名化された IP アドレス、アクセスした
            URL、ページビュー、および閲覧習慣などのデータが含まれる場合があります。
            アクセスした URL には、ユーザーのデバイスや家電に固有の ID
            が含まれている場合があります。アクセスした URL
            は送信時に匿名化処理が行われるよう設計していますが、確実に匿名化されることを保証するものではありません。
            匿名化処理が行われた場合は、固有の ID
            のかわりに、デバイスのファームウェアバージョンや家電の種類が含まれる場合があります。
          </p>
        </li>
      </ol>
      <h3 class="text-xl">情報の使用方法</h3>
      <p>収集した情報を使用して:</p>
      <ul class="list-disc pl-5">
        <li>ユーザーが開始するAPIリクエストを容易にします。</li>
        <li>
          アクセスデータの分析を決定した場合、ユーザーの行動を理解し、サービスを改善するために使用します。
        </li>
      </ul>
      <h3 class="text-xl">データの安全性への取り組み</h3>
      <p>
        私たちの設計の哲学は、リスクを最小限に抑えるために、機密情報を送信または保存しないようにすることです。
        ユーザーによって提供されたアクセストークンは、Nature の API
        サーバーにのみ送信され、当サービスのサーバーが処理または保持することはありません。
        アクセストークンや Nature の API
        サーバーからのレスポンスは、キャッシュのためユーザーのブラウザのストレージに保存される場合があります。
      </p>
      <h3 class="text-xl">サードパーティサービス</h3>
      <p>
        当サービスは Cloudflare を通じて提供されています。
        また、アクセス解析のため Cloudflare Web Analytics
        を使用する場合があります。
        これらのサービスのプライバシーポリシーについては、各サービスのウェブサイトをご覧ください。
      </p>
      <h3 class="text-xl">本プライバシーポリシーの変更</h3>
      <p>
        このプライバシーポリシーは更新される場合があります。
        変更は、掲載された時点で即時に有効となります。
        ユーザーには、定期的にプライバシーポリシーを確認し、情報を最新の状態に保つようおすすめします。
      </p>
      <h3 class="text-xl">お問い合わせ</h3>
      <p>
        このプライバシーポリシーに関する質問や懸念がある場合は、GitHub
        リポジトリの Issues よりご連絡ください。
      </p>
    </div>
    <div
      class="w-full flex items-center justify-center gap-4 text-2xl text-gray-600 dark:text-gray-400 pb-4"
    >
      <ULink
        class="inline-block rounded"
        :class="STYLE_FOCUS_VISIBLE_RING"
        to="/"
        aria-label="ホーム"
      >
        <UIcon name="i-mdi:home" />
      </ULink>
      <ULink
        class="inline-block rounded"
        :class="STYLE_FOCUS_VISIBLE_RING"
        to="https://github.com/SegaraRai/luonto"
        target="_blank"
        aria-label="GitHub リポジトリ"
      >
        <UIcon name="i-mdi:github" />
      </ULink>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: "Luonto について",
  meta: [
    ...getCommonMeta(),
    {
      name: "description",
      content: "Luonto は、Nature Remo の非公式 Web アプリです",
    },
  ],
  link: getCommonLink(true),
  script: getCommonScript(),
  htmlAttrs: {
    lang: "ja",
  },
});
</script>
