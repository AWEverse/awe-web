const Readme = () => {
  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl lg:text-3xl font-bold mb-4">
        Разработка frontend приложения
      </h2>
      <p className="text-lg lg:text-xl leading-relaxed mb-4">
        Когда мне предстоит разработать большое приложение полностью самому, то
        я начинаю с frontend приложения. Потому что высока вероятность что в
        ходе проектирования я мог что-то упустить, поэтому сначала я проектирую
        пользовательский интерфейс смотрю удобно ли им пользоваться, требуется
        ли поменять форму и логику и уже после этого начинаю проектирование
        бэкенда. Часто бывает то что было разработано в макетах не user friendly
        и пользователь просто не захочет пользоваться таким продуктом.
      </p>
      <h3 className="text-xl lg:text-2xl font-bold mb-4">
        Базовая архитектура проекта
      </h3>
      <p className="text-lg lg:text-xl leading-relaxed mb-4">
        Для web приложения будем использовать стэк: ReactJS +TypeScript + Mobx.
        Я выбрал такой стэк поскольку хорошо знаю его. Выбрал React поскольку
        нам будет достаточно клиентского рендеринга у него большое комьюнити и я
        хорошо знаю его. И очень рекомендую использовать типизированные языки и
        это сильно спасает от вероятности совершить ошибку и по мере роста
        проекта вероятность ошибиться будет увеличиваться. Тут рекомендую
        выбирать тот стэк на котором вы чувствуете себя максимально комфортно.
        Давайте разобьём проект на слои, я здесь вижу 6 слоёв:
      </p>
      <ul className="list-disc ml-6 mb-4">
        <li className="mb-2">routing – реализация нашей навигации</li>
        <li className="mb-2">models – централизованное хранилище mobx</li>
        <li className="mb-2">pages – страницы нашего приложения</li>
        <li className="mb-2">ui-kit – базовые компоненты</li>
        <li className="mb-2">components – компоненты приложения</li>
        <li className="mb-2">lib – вспомогательные классы и функции</li>
      </ul>
      <h3 className="text-xl lg:text-2xl font-bold mb-4">Routing</h3>
      <p className="text-lg lg:text-xl leading-relaxed">
        Маршрутизатор позволяет создавать вложенные пути, но важно помнить, что
        дочерний элемент должен указывать полный путь к родительскому.
      </p>
      <p className="text-lg lg:text-xl leading-relaxed">
        В первом элементе объекта я передаю компонент Layout, который реализует
        базовую структуру страницы. Внутри этого компонента я использую Outlet
        из пакета react-router для передачи вложенных элементов.
      </p>

      <pre className="bg-gray-800 p-4 mt-4 rounded-md">
        <code className="block text-xs">
          <span className="text-blue-400">import</span> React{" "}
          <span className="text-blue-400">from</span> "react";
          <br />
          <span className="text-blue-400">import</span> &#123;
          createBrowserRouter, RouterProvider &#125;{" "}
          <span className="text-blue-400">from</span> "react-router";
          <br />
          <span className="text-blue-400">import</span> Dashboard{" "}
          <span className="text-blue-400">from</span> "@/pages/Dashboard";
          <br />
          <span className="text-blue-400">import</span> CreateCampaign{" "}
          <span className="text-blue-400">from</span>{" "}
          "@/pages/Campaign/CreateCampaign";
          <br />
          <span className="text-blue-400">import</span> EditCampaign{" "}
          <span className="text-blue-400">from</span>{" "}
          "@/pages/Campaign/EditCampaign";
          <br />
          <span className="text-blue-400">import</span> Layout{" "}
          <span className="text-blue-400">from</span> "@/components/Layout";
          <br />
          <br />
          const router = createBrowserRouter([
          <br />
          &nbsp;&nbsp;&#123;
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;path: "/",{" "}
          <span className="text-green-400">element:</span> &lt;Layout /&gt;,
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;children: [
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#123; path: "/",{" "}
          <span className="text-green-400">element:</span> &lt;Dashboard /&gt;
          &#125;,
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#123;
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;path: "/campaign",
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <span className="text-green-400">element:</span> null,
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;children: [
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#123;
          path: "/campaign/create",{" "}
          <span className="text-green-400">element:</span> &lt;CreateCampaign
          /&gt; &#125;,
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#123;
          path: "/campaign/edit/:id",{" "}
          <span className="text-green-400">element:</span> &lt;EditCampaign
          /&gt; &#125;,
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;],
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#125;,
          <br />
          &nbsp;&nbsp;&#125;,
          <br />
          ]);
          <br />
          <br />
          <span className="text-blue-400">export default</span>{" "}
          <span className="text-green-400">function</span> Router() &#123;
          <br />
          &nbsp;&nbsp;<span className="text-blue-400">return</span>{" "}
          &lt;RouterProvider router=&#123;router&#125; /&gt;;
          <br />
          &#125;
        </code>
      </pre>
      <div className="w-full my-4">
        <img
          alt="Frontend Development Diagram"
          className="w-full rounded-md"
          src={
            "https://habrastorage.org/r/w1560/getpro/habr/upload_files/46b/23d/74d/46b23d74dc22dcbb6393fbef5d38d00d.png"
          }
        />
        <p className="text-sm  mt-2">
          This diagram illustrates the frontend development process.
        </p>
      </div>
    </div>
  );
};

export default Readme;
