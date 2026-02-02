import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Paper,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { useTeam, type TeamMember } from 'modules/team';
import { getRoleColor } from 'modules/team/utils/role-colors';

interface TeamMembersTableProps {
  members: TeamMember[];
  onEdit: (member: TeamMember) => void;
  onRemove: (member: TeamMember) => void;
  onLeave: () => void;
}

const TeamMembersTable = ({
  members,
  onEdit,
  onRemove,
  onLeave,
}: TeamMembersTableProps) => {
  const { canEditMember, canRemoveMember, canLeave, isCurrentUser } = useTeam();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getMemberName = (member: TeamMember) => {
    return [member.firstName, member.lastName].filter(Boolean).join(' ') || member.email;
  };

  if (members.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">
          No team members yet. Invite someone to get started!
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table aria-label="Team members list">
        <TableHead>
          <TableRow>
            <TableCell>Member</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Joined</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {members.map((member) => {
            const memberName = getMemberName(member);
            const isCurrent = isCurrentUser(member);

            return (
              <TableRow
                key={member.id}
                sx={{
                  bgcolor: isCurrent ? 'action.hover' : 'inherit',
                }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      src={member.avatarUrl}
                      alt={memberName}
                      sx={{ width: 40, height: 40 }}
                    >
                      {memberName?.[0]?.toUpperCase()}
                    </Avatar>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight={500}>
                          {memberName}
                        </Typography>
                        {isCurrent && (
                          <Chip
                            label="You"
                            size="small"
                            variant="outlined"
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        )}
                        {member.isMaster && (
                          <Tooltip title="Master Account">
                            <IconifyIcon
                              icon="mdi:star"
                              sx={{ fontSize: 16, color: 'warning.main' }}
                            />
                          </Tooltip>
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {member.email}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={member.role.charAt(0).toUpperCase() + member.role.slice(1).replace('_', ' ')}
                    color={getRoleColor(member.role)}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(member.joinedAt)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                    {isCurrent ? (
                      <Tooltip title={canLeave() ? 'Leave Team' : 'Cannot leave (you are the only owner)'}>
                        <span>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={onLeave}
                            disabled={!canLeave()}
                            aria-label="Leave team"
                          >
                            <IconifyIcon icon="mdi:exit-to-app" sx={{ fontSize: 20 }} />
                          </IconButton>
                        </span>
                      </Tooltip>
                    ) : (
                      <>
                        {canEditMember(member) && (
                          <Tooltip title="Edit Role">
                            <IconButton
                              size="small"
                              onClick={() => onEdit(member)}
                              aria-label={`Edit role for ${memberName}`}
                            >
                              <IconifyIcon icon="mdi:pencil-outline" sx={{ fontSize: 20 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                        {canRemoveMember(member) && (
                          <Tooltip title="Remove Member">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => onRemove(member)}
                              aria-label={`Remove ${memberName} from team`}
                            >
                              <IconifyIcon icon="mdi:account-remove-outline" sx={{ fontSize: 20 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TeamMembersTable;
