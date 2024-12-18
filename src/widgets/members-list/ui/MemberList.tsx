import MemberCard, { MemberCardProps } from '@/entities/MemberCard';

interface OwnProps {
  members: MemberCardProps[];
}

type MembersListProps = OwnProps;

const MembersList: React.FC<MembersListProps> = props => {
  const { members } = props;

  return members.map((member, i) => (
    <MemberCard
      key={i}
      avatar={member.avatar}
      description={member.description}
      joinDate={member.joinDate}
      username={member.username}
    />
  ));
};

export { MembersList };
