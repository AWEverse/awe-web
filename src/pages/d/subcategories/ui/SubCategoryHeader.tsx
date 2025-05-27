import DividerHorizontal from "@/shared/ui/DividerHorizontal";
import s from "./SubCategoryHeader.module.scss";
import { Grid3x3 } from "@mui/icons-material";
import { FC } from "react";

const subCategories = [
  { title: "Universal media machines", nodes: 44, updated: "4 months ago" },
  { title: "Turing machines", nodes: 0, updated: "last month" },
  { title: "Banked agents", nodes: 154, updated: "2 months ago" },
  { title: "Crypto", nodes: 3, updated: "last month" },
  { title: "Untitled", nodes: 11, updated: "last month" },
  { title: "Untitled", nodes: 9, updated: "2 months ago" },
  { title: "Ness", nodes: 397, updated: "4 months ago" },
];

const SubCategoryHeader: FC = () => {
  return (
    <header className={s.header}>
      <h1 className={s.title}>Computer science</h1>
      <p className={s.desc}>
        Collection of papers and articles spanning various subfields of computer
        science. This library covers topics from foundational concepts to
        cutting-edge developments, with a particular emphasis on machine
        learning, artificial intelligence, data analysis, and algorithms.
      </p>
      <div className={s.categoriesWrap}>
        <DividerHorizontal position={0} className={s.divider}>
          <h3 className={s.categoriesTitle}>Authors</h3>
        </DividerHorizontal>

        <DividerHorizontal position={0} className={s.divider}>
          <h3 className={s.categoriesTitle}>Categories</h3>
        </DividerHorizontal>

        <div className={s.grid}>
          {subCategories.map((cat, i) => (
            <div key={cat.title + i} className={s.card} tabIndex={0}>
              <div className={s.iconWrap}>
                <Grid3x3 />
              </div>
              <div className={s.cardTitle}>{cat.title}</div>
              <div className={s.cardNodes}>
                {cat.nodes === 0 ? "Empty" : `${cat.nodes} posts`}
              </div>
              <div className={s.cardUpdated}>{cat.updated}</div>
            </div>
          ))}
        </div>
      </div>

      <DividerHorizontal position={0} className={s.divider}>
        <h3 className={s.categoriesTitle}>Posts</h3>
      </DividerHorizontal>
    </header>
  );
};

export default SubCategoryHeader;
