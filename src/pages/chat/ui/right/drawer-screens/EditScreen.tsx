import { FC, memo, useState } from "react";
import TextInput from "@/shared/ui/TextInput";
import s from "./EditScreen.module.scss";
import HeaderNavigation from "../../common/HeaderNavigation";
import buildClassName from "@/shared/lib/buildClassName";
import TextArea from "@/shared/ui/TextArea";
import ActionButton from "@/shared/ui/ActionButton";
import { MAX_BIO_LENGTH } from "@/lib/config/app";
import { useStableCallback } from "@/shared/hooks/base";
import useChatStore from "@/pages/chat/store/useChatSelector";

interface OwnProps {
  nodeRef?: React.RefObject<HTMLDivElement>;
  className?: string;
}

const EditScreen: FC<OwnProps> = ({ nodeRef, className }) => {
  const toggleRightEditingPanel = useChatStore((s) => s.toggleProfileEditing);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    description: "",
    username: "",
  });

  const handleChange = useStableCallback(
    (field: keyof typeof formData) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      },
  );

  const handleSubmit = () => {
    console.log("Saving profile:", formData);
    toggleRightEditingPanel();
  };

  return (
    <div ref={nodeRef} className={buildClassName(s.EditScreen, className)}>
      <HeaderNavigation
        className={"RightHeaderNavigation"}
        name="Edit Your Profile"
        onPrevClick={toggleRightEditingPanel}
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <section className={s.EditForm}>
          <TextInput
            label="First Name"
            value={formData.firstName}
            onChange={handleChange("firstName")}
            required
          />
          <TextInput
            label="Last Name"
            value={formData.lastName}
            onChange={handleChange("lastName")}
            required
          />

          <TextArea
            value={formData.description}
            onChange={handleChange("description")}
            placeholder="Share a bit about yourself"
            maxLengthCount={MAX_BIO_LENGTH}
          />
        </section>

        <article className={s.EditExplanation}>
          <p>
            Add key information about yourself, such as interests, location, or
            profession. For example: "28 years old, software engineer from
            London."
          </p>
        </article>

        <h3 className={s.EditHeader}>Username</h3>
        <section className={s.EditForm}>
          <TextInput
            label="Choose a unique username (optional)"
            variant="slide"
            value={formData.username}
            onChange={handleChange("username")}
          />
        </section>

        <article className={s.EditExplanation}>
          <p>
            You can set your public username in <b>AWE</b>. This name helps
            other users find and connect with you, even if they don't know your
            phone number.
          </p>
          <p>
            Please use only <b>a–z</b>, <b>0–9</b>, and underscores. Usernames
            must be at least <b>5</b> characters long.
          </p>
          <p>
            Your username must be unique, and you can change it anytime in your
            profile settings. Choose something that reflects your personality or
            interests.
          </p>
        </article>

        <div className={s.ButtonContainer}>
          <ActionButton type="submit" className={s.SaveButton}>
            Save Changes
          </ActionButton>
        </div>
      </form>
    </div>
  );
};

export default memo(EditScreen);
