import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import Container from '../../Components/Container';
import { Form, SubmitButton, List } from './styles';

import api from '../../services/api';

export default class Main extends Component {
  constructor() {
    super();
    this.state = {
      newRepo: '',
      repositories: [],
      loading: false,
      error: null,
    };
  }

  componentDidMount() {
    const repositories = localStorage.getItem('repositories');
    if (repositories) {
      this.setState({ repositories: JSON.parse(repositories) });
    }
  }

  componentDidUpdate(_, prevState) {
    const { repositories } = this.state;
    if (prevState.repositories !== repositories) {
      localStorage.setItem('repositories', JSON.stringify(repositories));
    }
  }

  handleInputChange = e => {
    this.setState({ newRepo: e.target.value });
  };

  handleSubmit = async e => {
    try {
      this.setState({ error: false, loading: true });
      e.preventDefault();
      const { newRepo, repositories } = this.state;
      const response = await api.get(`repos/${newRepo}`);

      if (!response) {
        // eslint-disable-next-line
        throw 'Repositório Inexistente';
      }

      if (repositories.indexOf(newRepo) !== -1) {
        // eslint-disable-next-line
        throw 'Repositório Já cadastrado.';
      }

      const data = {
        name: response.data.full_name,
      };
      this.setState({
        repositories: [...repositories, data],
        newRepo: '',
        loading: false,
        error: false,
      });
    } catch (err) {
      this.setState({ error: true, newRepo: '', loading: false });
    }
  };

  render() {
    const { newRepo, repositories, loading, error } = this.state;

    return (
      <Container>
        <h1>
          <FaGithubAlt />
          Repositórios
        </h1>
        <Form onSubmit={this.handleSubmit} error={error}>
          <input
            type='text'
            value={newRepo}
            onChange={this.handleInputChange}
            placeholder='Adicionar repositório'
          />

          <SubmitButton loading={loading}>
            {loading ? (
              <FaSpinner color='#FFF' size={14} />
            ) : (
              <FaPlus color='#FFF' size={14} />
            )}
          </SubmitButton>
        </Form>
        <List>
          {repositories.map(repo => (
            <li key={repo.name}>
              <span>{repo.name}</span>
              <Link to={`/repository/${encodeURIComponent(repo.name)}`}>
                Detalhe
              </Link>
            </li>
          ))}
        </List>
      </Container>
    );
  }
}
